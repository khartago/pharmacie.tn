# Medicine Import System

This document describes the medicine import functionality for the Pharmacie.tn backend.

## Overview

The medicine import system allows administrators and suppliers to upload Excel files containing the official medicine list and automatically import them into the database. The system handles file validation, parsing, database operations, and audit logging.

## Features

- **File Upload**: Accepts Excel files (.xls, .xlsx) via multipart form data
- **File Management**: Automatically manages file storage and cleanup
- **Data Validation**: Validates file format and content
- **Database Operations**: Atomic transactions for data integrity
- **Audit Logging**: Tracks all import operations
- **Error Handling**: Comprehensive error handling with rollback
- **Role-based Access**: Restricted to ADMIN and SUPPLIER roles

## API Endpoints

### Import Medicines
- **URL**: `POST /api/admin/medicines/import`
- **Authentication**: Required (ADMIN or SUPPLIER role)
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `file`: Excel file (.xls or .xlsx)

**Response**:
```json
{
  "success": true,
  "message": "Medicines imported successfully",
  "data": {
    "total": 1500,
    "importedAt": "2025-08-22T03:55:01.128Z"
  }
}
```

### Get Medicine Count
- **URL**: `GET /api/admin/medicines/count`
- **Authentication**: Required (ADMIN or SUPPLIER role)

**Response**:
```json
{
  "count": 1500,
  "lastUpdated": "2025-08-22T03:55:01.128Z"
}
```

## File Requirements

### Supported Formats
- `.xls` (Excel 97-2003)
- `.xlsx` (Excel 2007+)

### File Size Limit
- Maximum: 10MB

### Expected Structure
The Excel file should have the following columns:
1. **Nom** (Column 0) - Brand Name / Nom commercial
2. **Dosage** (Column 1) - Dosage
3. **Forme** (Column 2) - Form / Forme pharmaceutique
4. **Présentation** (Column 3) - Presentation
5. **DCI** (Column 4) - Dénomination Commune Internationale
6. **Classe** (Column 5) - Class (used as ATC Code)
7. **Sous Classe** (Column 6) - Subclass
8. **Laboratoire** (Column 7) - Laboratory
9. **AMM** (Column 8) - Marketing Authorization Number
10. **Date AMM** (Column 9) - Marketing Authorization Date
11. **Conditionnement primaire** (Column 10) - Primary packaging
12. **Spécification Conditionnement primaire** (Column 11) - Primary packaging specification
13. **tableau** (Column 12) - Table
14. **Durée de conservation** (Column 13) - Shelf life
15. **Indications** (Column 14) - Indications
16. **G/P/B** (Column 15) - G/P/B classification
17. **VEIC** (Column 16) - VEIC

### Required Columns for Import
The system extracts and uses the following columns:
- **Column 0 (Nom)** → Brand Name
- **Column 1 (Dosage)** → Dosage
- **Column 2 (Forme)** → Form
- **Column 4 (DCI)** → DCI
- **Column 5 (Classe)** → ATC Code
- **Column 7 (Laboratoire)** → Laboratory

### Example Structure
| Nom | Dosage | Forme | Présentation | DCI | Classe | Sous Classe | Laboratoire | ... |
|-----|--------|-------|--------------|-----|--------|-------------|-------------|-----|
| Doliprane | 500mg | Comprimé | Boîte de 16 | Paracétamol | N02BE01 | Analgésiques | Sanofi | ... |
| Advil | 400mg | Gélule | Boîte de 20 | Ibuprofène | M01AE01 | Anti-inflammatoires | Pfizer | ... |

## Implementation Details

### File Storage
- **Location**: `src/utils/liste_amm.xls`
- **Management**: Only one file is kept at a time
- **Cleanup**: Old files are automatically deleted before new uploads

### Database Operations
1. **Validation**: File type and structure validation
2. **Transaction**: Atomic database operations
3. **Cleanup**: Delete all existing medicines
4. **Import**: Insert new medicines from file
5. **Audit**: Log the import operation

### Error Handling
- **File Validation**: Invalid file types are rejected
- **Parsing Errors**: Excel parsing errors are caught and reported
- **Database Errors**: Transaction rollback on database errors
- **File Cleanup**: Uploaded files are cleaned up on errors

### Security
- **Authentication**: JWT token required
- **Authorization**: ADMIN or SUPPLIER role required
- **File Validation**: Strict file type checking
- **Size Limits**: File size restrictions

## Usage Examples

### Using cURL
```bash
# Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@pharmacie.tn", "password": "admin123"}'

# Import medicines
curl -X POST http://localhost:3000/api/admin/medicines/import \
  -H "Authorization: Bearer <token>" \
  -F "file=@liste_amm.xls"
```

### Using JavaScript/Fetch
```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@pharmacie.tn',
    password: 'admin123'
  })
});

const { data: { token } } = await loginResponse.json();

// Import medicines
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const importResponse = await fetch('/api/admin/medicines/import', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const result = await importResponse.json();
console.log(`Imported ${result.data.total} medicines`);
```

## Audit Logging

Every successful import operation creates an audit log entry:
- **Action**: `IMPORT_MEDICINES`
- **Entity Type**: `SYSTEM`
- **Entity ID**: `null`
- **Details**: `{ total: number }`
- **User**: The user who performed the import

## Error Responses

### Invalid File Type
```json
{
  "error": "Invalid file type. Only .xls and .xlsx files are allowed."
}
```

### No File Uploaded
```json
{
  "error": "No file uploaded. Please provide a file in the \"file\" field."
}
```

### Parsing Error
```json
{
  "error": "Failed to import medicines. Please try again."
}
```

### Authentication Error
```json
{
  "success": false,
  "error": "Access token required"
}
```

### Authorization Error
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

## Monitoring and Maintenance

### File Management
- Monitor disk space usage in `src/utils/`
- Ensure proper file permissions
- Regular cleanup of temporary files

### Database Monitoring
- Monitor medicine table size
- Track import frequency and volume
- Review audit logs for import operations

### Performance Considerations
- Large files may take time to process
- Database operations are batched for efficiency
- File parsing is optimized for memory usage

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check user role (must be ADMIN or SUPPLIER)
2. **400 Bad Request**: Verify file format (.xls or .xlsx)
3. **413 Payload Too Large**: File exceeds 10MB limit
4. **500 Internal Server Error**: Check server logs for details

### Debug Steps
1. Verify authentication token
2. Check file format and size
3. Review server logs
4. Test with smaller file
5. Verify database connectivity

## Future Enhancements

- **Batch Processing**: Support for multiple file uploads
- **Progress Tracking**: Real-time import progress
- **Data Validation**: Enhanced content validation
- **Backup**: Automatic backup before import
- **Scheduling**: Scheduled import operations
- **Notifications**: Email notifications for import completion 