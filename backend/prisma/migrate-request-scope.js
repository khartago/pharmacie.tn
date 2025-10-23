const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateRequestScope() {
  try {
    console.log('Starting migration of request scope system...');
    
    // Get all existing requests with region data
    const existingRequests = await prisma.request.findMany({
      select: {
        id: true,
        region: true
      }
    });
    
    console.log(`Found ${existingRequests.length} existing requests to migrate`);
    
    // Update each request to use the new scope system
    for (const request of existingRequests) {
      let scope = 'REGION';
      let regions = null;
      
      if (request.region === 'ALL_TUNISIA') {
        scope = 'ALL_TUNISIA';
      } else {
        scope = 'REGION';
        regions = [request.region];
      }
      
      await prisma.request.update({
        where: { id: request.id },
        data: {
          scope: scope,
          regions: regions
        }
      });
      
      console.log(`Migrated request ${request.id}: ${request.region} -> ${scope}`);
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateRequestScope();
