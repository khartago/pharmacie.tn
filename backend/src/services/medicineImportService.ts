import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import { AuditService } from './auditService';

const prisma = new PrismaClient();

export interface MedicineImportResult {
  total: number;
  importedAt: Date;
}

export class MedicineImportService {

  /**
   * Import medicines from Excel file
   */
  static async importMedicines(file: Express.Multer.File, userId: string): Promise<MedicineImportResult> {
    try {
      console.log(`🚀 Starting medicine import for file: ${file.originalname}`);
      
      // Validate file type
      if (!this.isValidFileType(file.originalname)) {
        throw new Error('Invalid file type. Only .xls and .xlsx files are allowed.');
      }

      // Parse Excel file directly from buffer (no file system operations)
      const medicines = await this.parseExcelFileFromBuffer(file.buffer);

      // Import to database (this will clean up old data first)
      const result = await this.importToDatabase(medicines);

      // Log the import
      await prisma.medicineImportLog.create({
        data: {
          filename: file.originalname,
          importedCount: result.total,
          importedBy: userId
        }
      });

      // Log audit entry
      await AuditService.logAction({
        userId,
        action: 'IMPORT_MEDICINES',
        entityType: 'SYSTEM',
        entityId: null,
        details: { total: result.total, filename: file.originalname }
      });

      console.log(`✅ Medicine import completed successfully: ${result.total} medicines imported`);
      return result;
    } catch (error) {
      console.error('❌ Medicine import failed:', error);
      throw error;
    }
  }

  /**
   * Validate file type
   */
  private static isValidFileType(filename: string): boolean {
    const validExtensions = ['.xls', '.xlsx'];
    const extension = path.extname(filename).toLowerCase();
    return validExtensions.includes(extension);
  }

  /**
   * Parse Excel file from buffer and extract medicine data
   */
  private static async parseExcelFileFromBuffer(buffer: Buffer): Promise<any[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      
      if (!sheetName) {
        throw new Error('No sheet found in Excel file');
      }
      
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        throw new Error('Worksheet not found');
      }
      
      // Convert to JSON with header row
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log('📊 Excel data preview:', data.slice(0, 3));
      
      // Skip header row and map to medicine structure
      const medicines = data.slice(1).map((row: any, index: number) => {
        // Based on actual Excel structure:
        // Column 0: Nom, Column 1: Dosage, Column 2: Forme, Column 4: DCI, Column 7: Laboratoire
        const medicine = {
          dci: this.cleanString(row[4]), // DCI is in column 4
          brandName: this.cleanString(row[0]), // Nom is in column 0
          dosage: this.cleanString(row[1]), // Dosage is in column 1
          form: this.cleanString(row[2]), // Forme is in column 2
          laboratoire: this.cleanString(row[7]), // Laboratoire is in column 7
          atcCode: this.cleanString(row[5] || '') // Classe is in column 5 (using as ATC code)
        };
        
        // Log first few medicines for debugging
        if (index < 3) {
          console.log(`📋 Medicine ${index + 1}:`, medicine);
        }
        
        return medicine;
      });

      // Import ALL medicines from the national list as-is
      // Only filter out completely empty rows (no data at all)
      const validMedicines = medicines.filter(medicine => {
        // Keep the medicine if it has any meaningful data
        const hasAnyData = medicine.dci || medicine.brandName || medicine.dosage || 
                          medicine.form || medicine.laboratoire || medicine.atcCode;
        return hasAnyData;
      });
      
      const filteredOut = medicines.length - validMedicines.length;

      console.log(`📊 Import Statistics:`);
      console.log(`   Total rows processed: ${medicines.length}`);
      console.log(`   Valid medicines: ${validMedicines.length}`);
      console.log(`   Filtered out: ${filteredOut} (empty rows only)`);
      
      if (filteredOut > 0) {
        console.log(`📋 Filtered out ${filteredOut} completely empty rows`);
      }

      return validMedicines;
    } catch (error) {
      console.error('❌ Error parsing Excel file:', error);
      throw new Error(`Error parsing Excel file: ${error}`);
    }
  }

  /**
   * Clean and normalize string values
   */
  private static cleanString(value: any): string {
    if (!value) return '';
    return String(value).trim();
  }

  /**
   * Import medicines to database
   */
  private static async importToDatabase(medicines: any[]): Promise<MedicineImportResult> {
    try {
      console.log(`🔄 Starting database import of ${medicines.length} medicines...`);
      
      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Get current count for comparison
        const currentCount = await tx.medicine.count();
        console.log(`📊 Current medicines in database: ${currentCount}`);
        
        // IMPORTANT: Delete all existing medicines FIRST to ensure clean import
        console.log('🗑️ Clearing existing medicines...');
        const deletedCount = await tx.medicine.deleteMany({});
        console.log(`🗑️ Deleted ${deletedCount.count} existing medicines`);
        
        // Insert new medicines in batches to avoid memory issues
        const batchSize = 1000;
        let totalInserted = 0;
        
        for (let i = 0; i < medicines.length; i += batchSize) {
          const batch = medicines.slice(i, i + batchSize);
          const createdMedicines = await tx.medicine.createMany({
            data: batch,
            skipDuplicates: true // Skip duplicates due to unique constraint on [dci, brandName, dosage, form, laboratoire]
          });
          totalInserted += createdMedicines.count;
          console.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}: ${createdMedicines.count} medicines (expected: ${batch.length})`);
          
          // Log if there's a discrepancy
          if (createdMedicines.count !== batch.length) {
            const skipped = batch.length - createdMedicines.count;
            console.log(`⚠️  Batch ${Math.floor(i / batchSize) + 1} skipped ${skipped} duplicate records`);
          }
        }

        const totalSkipped = medicines.length - totalInserted;
        console.log(`✅ Total medicines imported: ${totalInserted}`);
        if (totalSkipped > 0) {
          console.log(`📊 Import Summary:`);
          console.log(`   Total records processed: ${medicines.length}`);
          console.log(`   Successfully imported: ${totalInserted}`);
          console.log(`   Skipped duplicates: ${totalSkipped}`);
        }
        
        return {
          total: totalInserted,
          importedAt: new Date()
        };
      });

      return result;
    } catch (error) {
      console.error('❌ Database import error:', error);
      throw new Error(`Error importing to database: ${error}`);
    }
  }

  /**
   * Get current medicine count
   */
  static async getMedicineCount(): Promise<number> {
    return await prisma.medicine.count();
  }

  /**
   * Get last import information
   */
  static async getLastImportInfo(): Promise<{ filename: string; importedCount: number; importedAt: Date } | null> {
    const lastImport = await prisma.medicineImportLog.findFirst({
      orderBy: { importedAt: 'desc' }
    });

    return lastImport ? {
      filename: lastImport.filename,
      importedCount: lastImport.importedCount,
      importedAt: lastImport.importedAt
    } : null;
  }
} 