# Audit Logging System

This document describes the comprehensive audit logging system implemented in the Pharmacie.tn backend for tracking security events, system lifecycle events, and cron task execution.

## Overview

The audit logging system provides detailed tracking of all user actions, system events, and automated processes to ensure compliance, security monitoring, and operational transparency.

## Audit Log Model

```prisma
model AuditLog {
  id         Int      @id @default(autoincrement())
  userId     String?  // Null for system actions
  action     String
  entityType String
  entityId   String?  // Can be null for some actions
  details    Json?
  createdAt  DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}
```

## Entity Types

The system uses the following entity types for categorization:

- `USER` - User-related actions
- `SECURITY` - Security events (login, password changes)
- `ANNOUNCEMENT` - Announcement lifecycle events
- `REQUEST` - Request lifecycle events
- `RETOUR` - Retour lifecycle events
- `NOTIFICATION` - Notification lifecycle events
- `SUBSCRIPTION` - Subscription lifecycle events
- `SUPPORT_TICKET` - Support ticket lifecycle events
- `SYSTEM` - System-level events (cron jobs, data purging)

## Security Events

### 1. Failed Login Attempts
- **Action**: `LOGIN_FAILED`
- **Entity Type**: `SECURITY`
- **User ID**: `null` (no user for failed attempts)
- **Details**: `{ email, ip, timestamp }`
- **Triggered**: When login fails due to invalid email or password

### 2. Password Reset Requests
- **Action**: `PASSWORD_RESET_REQUESTED`
- **Entity Type**: `SECURITY`
- **User ID**: User requesting reset
- **Details**: `{ email, timestamp }`
- **Triggered**: When user requests password reset

### 3. Password Changes
- **Action**: `PASSWORD_CHANGED`
- **Entity Type**: `SECURITY`
- **User ID**: User changing password
- **Details**: `{ email, timestamp }`
- **Triggered**: When password is successfully reset

### 4. Account Creation
- **Action**: `ACCOUNT_CREATED`
- **Entity Type**: `USER`
- **User ID**: Admin creating the account
- **Details**: `{ createdUserId, email, role, createdBy, timestamp }`
- **Triggered**: When admin creates a new pharmacy or supplier account

### 5. Welcome Email Sent
- **Action**: `WELCOME_EMAIL_SENT`
- **Entity Type**: `USER`
- **User ID**: `null` (system action)
- **Details**: `{ email, timestamp }`
- **Triggered**: When welcome email is successfully sent to new account

## Post Lifecycle Events

### Announcements

#### 1. Announcement Creation
- **Action**: `ANNOUNCEMENT_CREATED`
- **Entity Type**: `ANNOUNCEMENT`
- **User ID**: Pharmacy user creating announcement
- **Details**: `{ medicineId, quantity, expiryDate, visibleToSupplier }`

#### 2. Announcement Updates
- **Action**: `ANNOUNCEMENT_UPDATED`
- **Entity Type**: `ANNOUNCEMENT`
- **User ID**: User updating announcement
- **Details**: `{ changes }`

#### 3. Announcement Deletion
- **Action**: `ANNOUNCEMENT_DELETED`
- **Entity Type**: `ANNOUNCEMENT`
- **User ID**: User deleting announcement
- **Triggered**: When announcement is manually deleted

#### 4. Announcement Expiration
- **Action**: `ANNOUNCEMENT_EXPIRED`
- **Entity Type**: `ANNOUNCEMENT`
- **User ID**: `null` (system action)
- **Triggered**: Daily cron job when `expiryDate < now()`

### Requests

#### 1. Request Creation
- **Action**: `REQUEST_CREATED`
- **Entity Type**: `REQUEST`
- **User ID**: User creating request
- **Details**: `{ medicineId, quantity, region }`

#### 2. Request Updates
- **Action**: `REQUEST_UPDATED`
- **Entity Type**: `REQUEST`
- **User ID**: User updating request
- **Details**: `{ changes }`

#### 3. Request Deletion
- **Action**: `REQUEST_DELETED`
- **Entity Type**: `REQUEST`
- **User ID**: User deleting request
- **Triggered**: When request is manually deleted

#### 4. Request Expiration
- **Action**: `REQUEST_EXPIRED`
- **Entity Type**: `REQUEST`
- **User ID**: `null` (system action)
- **Triggered**: Daily cron job when request is older than 48h and still OPEN

### Retours

#### 1. Retour Creation
- **Action**: `RETOUR_CREATED`
- **Entity Type**: `ANNOUNCEMENT`
- **User ID**: Pharmacy user creating retour
- **Details**: `{ type: 'RETOUR' }`
- **Triggered**: When announcement is created with `visibleToSupplier: true`

#### 2. Retour Acceptance
- **Action**: `RETOUR_ACCEPTED`
- **Entity Type**: `ANNOUNCEMENT`
- **User ID**: Supplier accepting retour
- **Triggered**: When supplier accepts retour (if implemented)

#### 3. Retour Refusal
- **Action**: `RETOUR_REFUSED`
- **Entity Type**: `ANNOUNCEMENT`
- **User ID**: Supplier refusing retour
- **Triggered**: When supplier refuses retour (if implemented)

#### 4. Retour Deletion
- **Action**: `RETOUR_DELETED`
- **Entity Type**: `ANNOUNCEMENT`
- **User ID**: User deleting retour
- **Details**: `{ type: 'RETOUR', timestamp }`
- **Triggered**: When retour announcement is manually deleted

#### 5. Retour Expiration
- **Action**: `RETOUR_EXPIRED`
- **Entity Type**: `ANNOUNCEMENT`
- **User ID**: `null` (system action)
- **Details**: `{ type: 'RETOUR', timestamp }`
- **Triggered**: Daily cron job when retour expires

## Notification Lifecycle Events

### 1. Notification Read
- **Action**: `NOTIFICATION_READ`
- **Entity Type**: `NOTIFICATION`
- **User ID**: User marking notification as read
- **Details**: `{ timestamp }`
- **Triggered**: When user marks notification as read

### 2. Notification Purge
- **Action**: `NOTIFICATION_PURGED`
- **Entity Type**: `NOTIFICATION`
- **User ID**: `null` (system action)
- **Details**: `{ count, timestamp }`
- **Triggered**: Weekly cron job deletes notifications older than 6 months

## Cron Task Execution

### 1. Daily Expiration Checks
- **Action**: `CRON_EXECUTED`
- **Entity Type**: `SYSTEM`
- **User ID**: `null` (system action)
- **Details**: `{ taskName: 'handleExpirations', summary: { announcementsExpired, retoursExpired, requestsExpired, subscriptionsExpired, announcementsNotified, requestsNotified } }`
- **Triggered**: Daily at midnight

### 2. Subscription Trial Ending Checks
- **Action**: `CRON_EXECUTED`
- **Entity Type**: `SYSTEM`
- **User ID**: `null` (system action)
- **Details**: `{ taskName: 'handleSubscriptionTrialEnding', summary: { subscriptionsNotified } }`
- **Triggered**: Daily at 9 AM

### 3. Weekly Archiving and Cleanup
- **Action**: `CRON_EXECUTED`
- **Entity Type**: `SYSTEM`
- **User ID**: `null` (system action)
- **Details**: `{ taskName: 'handleWeeklyArchiving', summary: { announcementsArchived, requestsArchived, notificationsPurged } }`
- **Triggered**: Weekly on Sunday at 2 AM

### 4. Monthly Retention and Purge
- **Action**: `CRON_EXECUTED`
- **Entity Type**: `SYSTEM`
- **User ID**: `null` (system action)
- **Details**: `{ taskName: 'handleMonthlyRetention', summary: { announcementsPurged, requestsPurged, auditLogsExported, oldAuditLogsPurged } }`
- **Triggered**: Monthly on 1st at 3 AM

## Data Retention and Archiving

### Archive Creation
- **Action**: `ARCHIVE_CREATED`
- **Entity Type**: `ANNOUNCEMENT` or `REQUEST`
- **User ID**: `null` (system action)
- **Details**: `{ count, timestamp }`
- **Triggered**: Weekly cron job moves expired data to archive tables

### Data Purge
- **Action**: `DATA_PURGED`
- **Entity Type**: `ANNOUNCEMENT_ARCHIVE`, `REQUEST_ARCHIVE`, or `AUDIT_LOG`
- **User ID**: `null` (system action)
- **Details**: `{ count, retentionPeriod, timestamp }`
- **Triggered**: Monthly cron job purges old archived data

### Audit Log Export
- **Action**: `AUDIT_LOGS_EXPORTED`
- **Entity Type**: `AUDIT_LOG`
- **User ID**: `null` (system action)
- **Details**: `{ count, exportPath, timestamp }`
- **Triggered**: Monthly cron job exports audit logs older than 2 years

## Implementation Details

### AuditService Methods

The `AuditService` class provides the following methods for logging:

#### Security Events
- `logLoginFailed(email, ip?)` - Log failed login attempts
- `logPasswordResetRequested(userId, email)` - Log password reset requests
- `logPasswordChanged(userId, email)` - Log successful password changes
- `logAccountCreated(adminId, userId, userData)` - Log account creation by admin
- `logWelcomeEmailSent(userId, email)` - Log welcome email sending

#### Lifecycle Events
- `logAnnouncementDeleted(userId, announcementId)` - Log announcement deletion
- `logRequestDeleted(userId, requestId)` - Log request deletion
- `logRetourDeleted(userId, announcementId)` - Log retour deletion
- `logRetourExpired(announcementId)` - Log retour expiration
- `logNotificationRead(userId, notificationId)` - Log notification read
- `logNotificationPurged(count)` - Log notification purge

#### Cron Execution
- `logCronExecuted(taskName, summary)` - Log cron task execution with summary

### Integration Points

#### Controllers
- **Auth Controller**: Logs failed logins, password reset requests, and password changes
- **Announcement Controller**: Logs announcement creation, updates, deletion, and retour creation
- **Request Controller**: Logs request creation, updates, and deletion
- **Notification Controller**: Logs notification read events

#### Cron Service
- **Daily Expirations**: Logs announcement, request, and retour expirations
- **Weekly Archiving**: Logs data archiving and notification purging
- **Monthly Retention**: Logs data purging and audit log exports

### Error Handling

- Audit logging failures do not break the main application flow
- All audit log operations are wrapped in try-catch blocks
- Failed audit logs are logged to console but don't throw errors

### Performance Considerations

- Audit logging is asynchronous and non-blocking
- Large audit log tables are automatically archived and purged
- Audit logs older than 2 years are exported to CSV and deleted from database
- Audit logs older than 5 years are permanently deleted

## Monitoring and Alerts

### Security Monitoring
- Failed login attempts are logged with IP addresses for security analysis
- Password reset requests are tracked for potential security threats
- All password changes are logged for audit compliance

### System Health Monitoring
- Cron job execution is logged with detailed summaries
- Data archiving and purging operations are tracked
- System performance can be monitored through audit log analysis

### Compliance and Reporting
- All user actions are logged for compliance requirements
- Data retention policies are enforced and logged
- Audit trails are maintained for regulatory compliance

## Future Enhancements

1. **Real-time Alerts**: Implement real-time alerts for suspicious security events
2. **Advanced Analytics**: Add analytics dashboard for audit log analysis
3. **Export Formats**: Support additional export formats (JSON, XML)
4. **Retention Policies**: Configurable retention policies per entity type
5. **Audit Log Search**: Advanced search and filtering capabilities
6. **Integration**: Integration with external security monitoring systems 