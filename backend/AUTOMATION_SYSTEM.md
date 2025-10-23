# 🔄 Pharmacie.tn Automation System

This document describes the comprehensive automation system implemented in the Pharmacie.tn backend, including notifications, audit logging, cron jobs, and data retention policies.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Notification System](#notification-system)
3. [Audit Logging](#audit-logging)
4. [Cron Jobs](#cron-jobs)
5. [Data Retention & Archiving](#data-retention--archiving)
6. [Database Schema Updates](#database-schema-updates)
7. [API Integration](#api-integration)
8. [Monitoring & Maintenance](#monitoring--maintenance)

## 🎯 Overview

The automation system provides:
- **Automatic notifications** for all important user actions
- **Comprehensive audit logging** for compliance and tracking
- **Scheduled tasks** for data management and cleanup
- **Long-term data retention** with archiving and purging policies
- **Real-time system monitoring** and health checks

## 📧 Notification System

### Notification Types

The system automatically creates notifications for the following events:

#### **Interest Notifications**
- When a pharmacy expresses interest in an announcement → notify announcement owner
- When interest is accepted/refused → notify the interested pharmacy

#### **Request Notifications**
- When a pharmacy creates a request → notify all pharmacies in the same region
- When another pharmacy responds → notify the requesting pharmacy
- When the request owner accepts a response → notify the responder

#### **Retour Notifications**
- When a retour is created (if `visibleToSupplier = true`) → notify the supplier
- When supplier accepts/refuses retour → notify the pharmacy

#### **Subscription Notifications**
- When trial will end in 5 days → notify user
- When subscription expires → notify user

#### **System Notifications**
- When announcements expire → notify pharmacy
- When requests expire → notify pharmacy

### Implementation

```typescript
// Example: Notify announcement owner when someone expresses interest
await NotificationService.notifyAnnouncementInterest(announcementId, interestedPharmacyId);

// Example: Notify all pharmacies in region when request is created
await NotificationService.notifyRequestCreated(requestId);
```

## 📝 Audit Logging

### Audit Log Structure

```typescript
interface AuditLogData {
  userId?: string | null;  // null for system actions
  action: string;          // e.g., 'USER_REGISTERED', 'ANNOUNCEMENT_CREATED'
  entityType: string;      // e.g., 'USER', 'ANNOUNCEMENT', 'REQUEST'
  entityId?: string | null; // ID of the affected entity
  details?: any;           // Additional context information
}
```

### Logged Actions

#### **User Actions**
- `USER_REGISTERED` - New user registration
- `USER_LOGIN` - User login
- `PHARMACY_UPDATED` - Admin updates pharmacy

#### **Announcement Actions**
- `ANNOUNCEMENT_CREATED` - New announcement
- `ANNOUNCEMENT_UPDATED` - Announcement modified
- `ANNOUNCEMENT_DELETED` - Announcement removed
- `ANNOUNCEMENT_EXPIRED` - System expiration

#### **Interest Actions**
- `INTEREST_EXPRESSED` - Pharmacy shows interest
- `INTEREST_ACCEPTED` - Interest accepted
- `INTEREST_REFUSED` - Interest refused

#### **Request Actions**
- `REQUEST_CREATED` - New request
- `REQUEST_RESPONDED` - Pharmacy responds
- `REQUEST_ACCEPTED` - Response accepted
- `REQUEST_UPDATED` - Request modified
- `REQUEST_DELETED` - Request removed
- `REQUEST_EXPIRED` - System expiration

#### **Retour Actions**
- `RETOUR_CREATED` - Retour announcement
- `RETOUR_ACCEPTED` - Retour accepted
- `RETOUR_REFUSED` - Retour refused

#### **Subscription Actions**
- `SUBSCRIPTION_CREATED` - New subscription
- `SUBSCRIPTION_STATUS_CHANGED` - Status update
- `SUBSCRIPTION_EXPIRED` - System expiration

#### **Support Actions**
- `SUPPORT_TICKET_CREATED` - New ticket
- `SUPPORT_TICKET_RESOLVED` - Ticket resolved

#### **System Actions**
- `ARCHIVE_CREATED` - Data archived
- `DATA_PURGED` - Data purged
- `AUDIT_LOGS_EXPORTED` - Logs exported

### Implementation

```typescript
// Example: Log user registration
await AuditService.logUserRegistration(userId, {
  email: user.email,
  role: user.role.name,
  city: user.city
});

// Example: Log announcement creation
await AuditService.logAnnouncementCreated(userId, announcementId, {
  medicineId,
  quantity,
  expiryDate,
  visibleToSupplier
});
```

## ⏰ Cron Jobs

### Scheduled Tasks

#### **Daily Tasks (Midnight)**
- **Expiration Checks**: Mark expired announcements, requests, and subscriptions
- **Notifications**: Send expiration notifications to affected users

#### **Daily Tasks (9 AM)**
- **Subscription Warnings**: Notify users whose trial ends in 5 days

#### **Weekly Tasks (Sunday 2 AM)**
- **Archiving**: Move expired data to archive tables
- **Cleanup**: Delete old notifications (6+ months)

#### **Monthly Tasks (1st of month 3 AM)**
- **Long-term Retention**: Purge old archived data
- **Audit Log Export**: Export old logs to CSV and purge from DB

### Implementation

```typescript
// Initialize cron jobs
CronService.initCronJobs();

// Cron patterns used:
// '0 0 * * *'     - Daily at midnight
// '0 9 * * *'     - Daily at 9 AM
// '0 2 * * 0'     - Weekly on Sunday at 2 AM
// '0 3 1 * *'     - Monthly on 1st at 3 AM
```

## 📦 Data Retention & Archiving

### Retention Policies

#### **Active Data**
- **Announcements**: Keep active for 6 months after expiration
- **Requests**: Keep active for 3 months after expiration
- **Notifications**: Keep for 6 months (read or unread)
- **Audit Logs**: Keep for 2 years in database

#### **Archive Data**
- **Announcements Archive**: Keep for 3 years, then purge
- **Requests Archive**: Keep for 1 year, then purge
- **Audit Logs**: Export to CSV after 2 years, purge after 5 years

#### **Permanent Data**
- **Subscriptions**: Never deleted (billing history)
- **Users**: Never deleted (account management)
- **Medicines**: Never deleted (product catalog)

### Archive Tables

#### **AnnouncementArchive**
```sql
CREATE TABLE announcements_archive (
  id SERIAL PRIMARY KEY,
  originalId INTEGER,           -- Reference to original
  medicineId INTEGER,
  quantity INTEGER,
  expiryDate TIMESTAMP,
  pharmacyUserId TEXT,
  supplierUserId TEXT,
  visibleToSupplier BOOLEAN,
  status AnnouncementStatus,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  archivedAt TIMESTAMP DEFAULT NOW()
);
```

#### **RequestArchive**
```sql
CREATE TABLE requests_archive (
  id SERIAL PRIMARY KEY,
  originalId INTEGER,           -- Reference to original
  userId TEXT,
  medicineId INTEGER,
  quantity INTEGER,
  region Region,
  status RequestStatus,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  archivedAt TIMESTAMP DEFAULT NOW()
);
```

### Implementation

```typescript
// Archive expired announcements
const announcementsToArchive = await prisma.announcement.findMany({
  where: {
    status: AnnouncementStatus.EXPIRED,
    updatedAt: { lt: sixMonthsAgo }
  }
});

// Move to archive
await prisma.announcementArchive.createMany({
  data: announcementsToArchive.map(announcement => ({
    originalId: announcement.id,
    // ... other fields
  }))
});

// Delete from main table
await prisma.announcement.deleteMany({
  where: { id: { in: announcementsToArchive.map(a => a.id) } }
});
```

## 🗄️ Database Schema Updates

### New Models

#### **Archive Tables**
- `AnnouncementArchive` - Archived announcements
- `RequestArchive` - Archived requests

#### **Enhanced Models**
- `AuditLog` - Enhanced with nullable fields for system actions
- `Notification` - Added `RETOUR` type

### Migration Strategy

1. **Backward Compatible**: All existing data preserved
2. **Gradual Migration**: Archive tables populated over time
3. **Data Integrity**: Foreign key relationships maintained
4. **Performance**: Indexes on archive tables for efficient queries

## 🔌 API Integration

### Controller Updates

All controllers now include:

```typescript
// Import services
import { NotificationService } from '../services/notificationService';
import { AuditService } from '../services/auditService';

// Example: Create announcement with notifications and audit
const announcement = await prisma.announcement.create({...});

// Log the action
await AuditService.logAnnouncementCreated(userId, announcement.id, data);

// Send notifications
if (visibleToSupplier) {
  await NotificationService.notifyRetourCreated(announcement.id);
}
```

### Updated Controllers

- **Auth Controller**: Registration and login logging
- **Announcement Controller**: Creation, updates, interests, retours
- **Request Controller**: Creation, responses, status updates
- **Support Controller**: Ticket creation and resolution

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Server health
curl http://localhost:3000/health

# Database health
curl http://localhost:3000/health/db
```

### Log Monitoring

#### **Console Logs**
- `📧 Notification created` - Notification events
- `📝 Audit log` - Audit events
- `🕐 Running daily expiration checks` - Cron job events
- `📦 Archived X announcements` - Archiving events
- `🗑️ Purged X records` - Cleanup events

#### **Database Monitoring**
- Monitor `audit_logs` table for system activity
- Check `notifications` table for delivery status
- Review archive tables for data retention compliance

### Maintenance Tasks

#### **Manual Cleanup**
```bash
# Run archiving manually
curl -X POST http://localhost:3000/api/admin/archive

# Export audit logs
curl -X POST http://localhost:3000/api/admin/export-logs
```

#### **Database Maintenance**
```sql
-- Check archive table sizes
SELECT 
  'announcements_archive' as table_name,
  COUNT(*) as record_count,
  MAX(archivedAt) as latest_archive
FROM announcements_archive
UNION ALL
SELECT 
  'requests_archive' as table_name,
  COUNT(*) as record_count,
  MAX(archivedAt) as latest_archive
FROM requests_archive;

-- Check audit log growth
SELECT 
  DATE(createdAt) as date,
  COUNT(*) as log_count
FROM audit_logs
WHERE createdAt >= NOW() - INTERVAL '30 days'
GROUP BY DATE(createdAt)
ORDER BY date;
```

## 🚀 Performance Considerations

### Optimization Strategies

1. **Batch Operations**: Archive and purge operations use batch processing
2. **Indexed Queries**: Archive tables have proper indexes
3. **Async Processing**: Notifications and audit logs don't block main operations
4. **Error Handling**: Failed operations don't break the main flow

### Scalability

1. **Horizontal Scaling**: Cron jobs can be distributed across multiple instances
2. **Database Partitioning**: Archive tables can be partitioned by date
3. **External Storage**: Audit logs can be moved to S3 or similar
4. **Queue System**: Notifications can be queued for better performance

## 🔒 Security & Compliance

### Data Protection

1. **Audit Trail**: All actions logged with user context
2. **Data Retention**: Compliant with regulatory requirements
3. **Access Control**: Archive data protected by same permissions
4. **Encryption**: Sensitive data encrypted at rest

### Compliance Features

1. **GDPR Compliance**: Right to be forgotten implemented
2. **Data Export**: Audit logs exported in standard formats
3. **Retention Policies**: Configurable retention periods
4. **Access Logging**: All data access logged

## 📈 Future Enhancements

### Planned Features

1. **Real-time Notifications**: WebSocket integration
2. **Advanced Analytics**: Dashboard for system metrics
3. **Custom Retention Policies**: Per-entity retention rules
4. **External Integrations**: Email, SMS, push notifications
5. **Machine Learning**: Predictive analytics for data management

### Monitoring Enhancements

1. **Metrics Dashboard**: Real-time system health
2. **Alert System**: Proactive issue detection
3. **Performance Tracking**: Response time monitoring
4. **Capacity Planning**: Resource usage forecasting

---

## 🎉 Conclusion

The Pharmacie.tn automation system provides a robust, scalable, and compliant foundation for managing the platform's data lifecycle. With automatic notifications, comprehensive audit logging, scheduled maintenance, and intelligent data retention, the system ensures optimal performance while maintaining data integrity and regulatory compliance.

The implementation follows best practices for enterprise applications and provides a solid foundation for future enhancements and scaling. 