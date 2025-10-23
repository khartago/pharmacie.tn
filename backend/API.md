# Pharmacie.tn API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
**Description:** User login
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": {
        "name": "PHARMACIE|FOURNISSEUR|ADMIN"
      }
    }
  }
}
```

### POST /auth/forgot-password
**Description:** Request password reset
**Body:**
```json
{
  "email": "string"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST /auth/reset-password
**Description:** Reset password with token
**Body:**
```json
{
  "token": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### POST /auth/register
**Description:** Register new user account
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "address": "string",
  "cityId": "string",
  "role": "PHARMACY|SUPPLIER"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": {
      "name": "PHARMACY|SUPPLIER"
    }
  },
  "message": "Account created successfully"
}
```

### GET /auth/me
**Description:** Get current user info
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": {
      "name": "PHARMACIE|FOURNISSEUR|ADMIN"
    }
  }
}
```

### PUT /auth/profile
**Description:** Update user profile
**Headers:** Authorization required
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "cityId": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "city": {
      "id": "string",
      "name": "string",
      "region": "string"
    }
  },
  "message": "Profile updated successfully"
}
```

---

## 🏥 Health Check Endpoints

### GET /health
**Description:** Basic health check
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Pharmacie.tn API",
  "version": "1.0.0"
}
```

### GET /health/db
**Description:** Database health check
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "connected": true,
    "responseTime": 15
  }
}
```

### GET /health/app
**Description:** Application health check
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 9000,
  "memory": {
    "used": 52428800,
    "total": 1073741824,
    "percentage": 4.9
  }
}
```

### GET /health/email
**Description:** Email service health check
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "email": {
    "configured": true,
    "testResult": "SMTP connection successful"
  }
}
```

### GET /health/queue
**Description:** Queue/cron jobs health check
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "queue": {
    "status": "Active",
    "jobs": 0
  }
}
```

---

## 📊 Analytics Endpoints (Admin Only)

### GET /analytics/overview
**Description:** Get overview statistics
**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalPharmacies": 120,
    "totalSuppliers": 30,
    "totalAnnouncements": 450,
    "totalRequests": 280
  }
}
```

### GET /analytics/top-medicines
**Description:** Get top requested medicines
**Query Parameters:**
- `period` (optional): "7" | "30" | "90" | "180" (days)
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "dci": "Paracétamol",
      "brandName": "Doliprane",
      "laboratoire": "Sanofi",
      "requestCount": 25
    }
  ]
}
```

### GET /analytics/requests-by-region
**Description:** Get requests grouped by region
**Query Parameters:**
- `period` (optional): "7" | "30" | "90" | "180" (days)
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "regionName": "Tunis",
      "requestCount": 45
    }
  ]
}
```

### GET /analytics/announcements-trend
**Description:** Get announcements trend over time
**Query Parameters:**
- `period` (optional): "7" | "30" | "90" | "180" (days)
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "count": 5
    }
  ]
}
```

### GET /analytics/active-pharmacies
**Description:** Get most active pharmacies
**Query Parameters:**
- `period` (optional): "7" | "30" | "90" | "180" (days)
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "Pharmacie Centrale",
      "email": "pharmacie@example.com",
      "cityName": "Tunis",
      "regionName": "Tunis",
      "announcementsCount": 15,
      "requestsCount": 8,
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /analytics/active-suppliers
**Description:** Get most active suppliers
**Query Parameters:**
- `period` (optional): "7" | "30" | "90" | "180" (days)
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "Fournisseur Pharma",
      "email": "fournisseur@example.com",
      "cityName": "Tunis",
      "regionName": "Tunis",
      "announcementsCount": 20,
      "retoursCount": 5,
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /analytics/activity
**Description:** Get activity timeline
**Query Parameters:**
- `period` (optional): "7" | "30" | "90" | "180" (days)
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "announcements": 3,
      "requests": 2,
      "retours": 1,
      "total": 6
    }
  ]
}
```

### GET /analytics/dashboard-stats
**Description:** Get dashboard statistics
**Query Parameters:**
- `period` (optional): "7" | "30" | "90" | "180" (days)
**Response:**
```json
{
  "success": true,
  "data": {
    "totalPharmacies": 120,
    "totalSuppliers": 30,
    "activeAnnouncements": 85,
    "openRequests": 45,
    "todayAnnouncements": 5,
    "todayRequests": 3,
    "totalMedicines": 1250
  }
}
```

---

## 📋 Audit Logs Endpoints (Admin Only)

### GET /audit
**Description:** Get audit logs with filters
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
- `action` (optional): string
- `userId` (optional): string
- `entityType` (optional): string
- `entityId` (optional): string
- `startDate` (optional): string (YYYY-MM-DD)
- `endDate` (optional): string (YYYY-MM-DD)
**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "string",
        "userId": "string",
        "action": "LOGIN",
        "entityType": "USER",
        "entityId": "string",
        "details": {},
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### GET /audit/:id
**Description:** Get specific audit log
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "action": "LOGIN",
    "entityType": "USER",
    "entityId": "string",
    "details": {},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /audit/stats/overview
**Description:** Get audit statistics
**Query Parameters:**
- `period` (optional): "7" | "30" | "90" | "180" (days)
**Response:**
```json
{
  "success": true,
  "data": {
    "totalLogs": 1500,
    "logsToday": 25,
    "logsThisWeek": 180,
    "logsThisMonth": 750
  }
}
```

### GET /audit/filters/available
**Description:** Get available filter options
**Response:**
```json
{
  "success": true,
  "data": {
    "actions": ["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE"],
    "entityTypes": ["USER", "ANNOUNCEMENT", "REQUEST", "RETOUR"],
    "users": [
      {
        "id": "string",
        "name": "string"
      }
    ]
  }
}
```

---

## 📤 Export Endpoints

### GET /export/pharmacies (Admin Only)
**Description:** Export pharmacies to CSV
**Response:** CSV file download

### GET /export/suppliers (Admin Only)
**Description:** Export suppliers to CSV
**Response:** CSV file download

### GET /export/announcements (Admin Only)
**Description:** Export announcements to CSV
**Response:** CSV file download

### GET /export/requests (Admin Only)
**Description:** Export requests to CSV
**Response:** CSV file download

### GET /export/support-tickets (Admin Only)
**Description:** Export support tickets to CSV
**Response:** CSV file download

### GET /export/audit-logs (Admin Only)
**Description:** Export audit logs to CSV
**Response:** CSV file download

### GET /export/accounts (Admin Only)
**Description:** Export accounts to CSV
**Response:** CSV file download

### GET /export/medicines (Admin Only)
**Description:** Export medicines to CSV
**Response:** CSV file download

### GET /export/analytics (Admin Only)
**Description:** Export analytics data to CSV
**Response:** CSV file download

### GET /export/health (Admin Only)
**Description:** Export system health data to CSV
**Response:** CSV file download

### GET /export/interests (Admin Only)
**Description:** Export interests data to CSV
**Response:** CSV file download

### GET /export/retours (Supplier Only)
**Description:** Export retours to CSV
**Response:** CSV file download

### GET /export/retour/:id/pdf (Fournisseur Only)
**Description:** Export retour as PDF
**Parameters:**
- `id`: string
**Response:** PDF file download

---

## 📦 Archive Endpoints (Admin Only)

### POST /archive/announcements
**Description:** Archive expired announcements
**Response:**
```json
{
  "success": true,
  "message": "Announcements archived successfully",
  "data": {
    "archivedCount": 15
  }
}
```

### POST /archive/requests
**Description:** Archive expired requests
**Response:**
```json
{
  "success": true,
  "message": "Requests archived successfully",
  "data": {
    "archivedCount": 8
  }
}
```

### POST /archive/retours
**Description:** Archive expired retours
**Response:**
```json
{
  "success": true,
  "message": "Retours archived successfully",
  "data": {
    "archivedCount": 3
  }
}
```

### GET /archive/announcements
**Description:** Get archived announcements
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
**Response:**
```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "id": "string",
        "medicine": {
          "dci": "string",
          "brandName": "string",
          "laboratoire": "string"
        },
        "quantity": 10,
        "expiryDate": "2024-01-01",
        "status": "ARCHIVED",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### POST /archive/announcements/:id/restore
**Description:** Restore archived announcement
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "message": "Announcement restored successfully"
}
```

---

## 🔔 Notifications Endpoints

### GET /notifications
**Description:** Get user notifications
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
- `read` (optional): boolean
**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "title": "string",
        "message": "string",
        "type": "ANNOUNCEMENT|REQUEST|RETOUR|SYSTEM",
        "isRead": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    },
    "unreadCount": 5
  }
}
```

### PUT /notifications/:id/read
**Description:** Mark notification as read
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### PUT /notifications/read-all
**Description:** Mark all notifications as read
**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "updatedCount": 5
  }
}
```

### GET /notifications/stats
**Description:** Get notification statistics
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5,
    "totalCount": 25,
    "byType": {
      "ANNOUNCEMENT": 10,
      "REQUEST": 8,
      "RETOUR": 5,
      "SYSTEM": 2
    }
  }
}
```

### DELETE /notifications/:id
**Description:** Delete notification
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

### GET /notifications/unread-count
**Description:** Get unread notifications count
**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

## 📢 Announcements Endpoints

### GET /announcements
**Description:** Get announcements
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
- `status` (optional): string
**Response:**
```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "id": "string",
        "medicine": {
          "dci": "string",
          "brandName": "string",
          "laboratoire": "string"
        },
        "quantity": 10,
        "expiryDate": "2024-01-01",
        "status": "ACTIVE",
        "user": {
          "name": "string",
          "city": {
            "name": "string",
            "regionName": "string"
          }
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### GET /announcements/:id
**Description:** Get specific announcement
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "medicine": {
      "dci": "string",
      "brandName": "string",
      "laboratoire": "string"
    },
    "quantity": 10,
    "expiryDate": "2024-01-01",
    "status": "ACTIVE",
    "user": {
      "name": "string",
      "city": {
        "name": "string",
        "regionName": "string"
      }
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /announcements
**Description:** Create announcement
**Headers:** Authorization required
**Body:**
```json
{
  "medicineId": "string",
  "quantity": 10,
  "expiryDate": "2024-01-01"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "medicine": {
      "dci": "string",
      "brandName": "string",
      "laboratoire": "string"
    },
    "quantity": 10,
    "expiryDate": "2024-01-01",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Announcement created successfully"
}
```

### PUT /announcements/:id
**Description:** Update announcement
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Body:**
```json
{
  "quantity": 15,
  "expiryDate": "2024-01-15"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "quantity": 15,
    "expiryDate": "2024-01-15"
  },
  "message": "Announcement updated successfully"
}
```

### DELETE /announcements/:id
**Description:** Delete announcement
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "message": "Announcement deleted successfully"
}
```

### POST /announcements/:id/interest
**Description:** Express interest in announcement
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "announcementId": "string",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Interest expressed successfully"
}
```

### GET /announcements/my-interests
**Description:** Get my interests on announcements
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "announcementId": "string",
      "status": "PENDING",
      "announcement": {
        "id": "string",
        "medicine": {
          "dci": "string",
          "brandName": "string",
          "laboratoire": "string"
        },
        "quantity": 10,
        "expiryDate": "2024-01-01",
        "pharmacy": {
          "name": "string",
          "region": "string",
          "phone": "string"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### PUT /announcements/:id/interests/:interestId
**Description:** Update interest status (accept/refuse)
**Parameters:**
- `id`: string (announcement ID)
- `interestId`: string
**Headers:** Authorization required
**Body:**
```json
{
  "status": "ACCEPTED|REFUSED"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "announcementId": "string",
    "status": "ACCEPTED|REFUSED",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Interest status updated successfully"
}
```

### DELETE /announcements/interests/:interestId
**Description:** Cancel interest in announcement
**Parameters:**
- `interestId`: string
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "message": "Interest cancelled successfully"
}
```

---

## 📝 Requests Endpoints

### GET /requests
**Description:** Get requests
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
- `status` (optional): string
**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "string",
        "medicine": {
          "dci": "string",
          "brandName": "string",
          "laboratoire": "string"
        },
        "quantity": 5,
        "status": "OPEN",
        "user": {
          "name": "string",
          "city": {
            "name": "string",
            "regionName": "string"
          }
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### GET /requests/:id
**Description:** Get specific request
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "medicine": {
      "dci": "string",
      "brandName": "string",
      "laboratoire": "string"
    },
    "quantity": 5,
    "status": "OPEN",
    "user": {
      "name": "string",
      "city": {
        "name": "string",
        "regionName": "string"
      }
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /requests
**Description:** Create request
**Headers:** Authorization required
**Body:**
```json
{
  "medicineId": "string",
  "quantity": 5
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "medicine": {
      "dci": "string",
      "brandName": "string",
      "laboratoire": "string"
    },
    "quantity": 5,
    "status": "OPEN",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Request created successfully"
}
```

### PUT /requests/:id
**Description:** Update request
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Body:**
```json
{
  "quantity": 10
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "quantity": 10
  },
  "message": "Request updated successfully"
}
```

### DELETE /requests/:id
**Description:** Delete request
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "message": "Request deleted successfully"
}
```

### POST /requests/:id/respond
**Description:** Respond to request
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Body:**
```json
{
  "status": "ACCEPTED|REFUSED"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "requestId": "string",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Response sent successfully"
}
```

### PUT /requests/:id/responses/:responseId
**Description:** Update response status (accept/refuse)
**Parameters:**
- `id`: string (request ID)
- `responseId`: string
**Headers:** Authorization required
**Body:**
```json
{
  "status": "ACCEPTED|REFUSED"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "requestId": "string",
    "status": "ACCEPTED|REFUSED",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Response status updated successfully"
}
```

---

## 🔄 Retours Endpoints

### GET /retours
**Description:** Get retours
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
- `status` (optional): string
**Response:**
```json
{
  "success": true,
  "data": {
    "retours": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "medicineName": "string",
        "quantity": 10,
        "expiryDate": "2024-01-01",
        "status": "PENDING",
        "pharmacyName": "string",
        "pharmacyRegion": "string",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 20,
      "totalPages": 2
    }
  }
}
```

### GET /retours/:id
**Description:** Get specific retour
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "medicineName": "string",
    "quantity": 10,
    "expiryDate": "2024-01-01",
    "status": "PENDING",
    "pharmacyName": "string",
    "pharmacyRegion": "string",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /retours
**Description:** Create retour
**Headers:** Authorization required
**Body:**
```json
{
  "title": "string",
  "description": "string",
  "medicineName": "string",
  "quantity": 10,
  "expiryDate": "2024-01-01"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "medicineName": "string",
    "quantity": 10,
    "expiryDate": "2024-01-01",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Retour created successfully"
}
```

### POST /retours/:id/accept
**Description:** Accept retour
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "message": "Retour accepted successfully"
}
```

### POST /retours/:id/refuse
**Description:** Refuse retour
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Body:**
```json
{
  "reason": "string"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Retour refused successfully"
}
```

---

## 💊 Medicines Endpoints

### GET /medicines
**Description:** Get medicines
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
**Response:**
```json
{
  "success": true,
  "data": {
    "medicines": [
      {
        "id": "string",
        "dci": "string",
        "brandName": "string",
        "laboratoire": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1250,
      "totalPages": 125
    }
  }
}
```

### GET /medicines/:id
**Description:** Get specific medicine
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "dci": "string",
    "brandName": "string",
    "laboratoire": "string"
  }
}
```

### GET /medicines/search
**Description:** Search medicines
**Query Parameters:**
- `query` (optional): string
- `dci` (optional): string
- `brandName` (optional): string
- `laboratoire` (optional): string
**Response:**
```json
{
  "success": true,
  "data": {
    "medicines": [
      {
        "id": "string",
        "dci": "string",
        "brandName": "string",
        "laboratoire": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

## 🆘 Support Endpoints

### GET /support
**Description:** Get support tickets
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
- `status` (optional): string
**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "string",
        "subject": "string",
        "message": "string",
        "status": "OPEN|IN_PROGRESS|RESOLVED|CLOSED",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 30,
      "totalPages": 3
    }
  }
}
```

### GET /support/:id
**Description:** Get specific support ticket
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "subject": "string",
    "message": "string",
    "status": "OPEN",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /support
**Description:** Create support ticket
**Headers:** Authorization required
**Body:**
```json
{
  "subject": "string",
  "message": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "subject": "string",
    "message": "string",
    "status": "OPEN",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Support ticket created successfully"
}
```

### PUT /support/:id
**Description:** Update support ticket
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Body:**
```json
{
  "subject": "string",
  "message": "string",
  "status": "RESOLVED"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "subject": "string",
    "message": "string",
    "status": "RESOLVED"
  },
  "message": "Support ticket updated successfully"
}
```

### DELETE /support/:id
**Description:** Delete support ticket
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "message": "Support ticket deleted successfully"
}
```

### POST /support/:id/reply
**Description:** Reply to support ticket
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Body:**
```json
{
  "replyMessage": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "replyMessage": "string",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Reply sent successfully"
}
```

### POST /support/contact
**Description:** Submit contact form (public)
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Contact form submitted successfully"
}
```

---

## 👥 Admin Account Management Endpoints

### GET /admin/accounts
**Description:** Get all accounts (Admin Only)
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
- `role` (optional): string
- `status` (optional): string
**Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "PHARMACIE|FOURNISSEUR|ADMIN",
        "status": "ACTIVE|INACTIVE",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastLoginAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

### GET /admin/pharmacies
**Description:** Get pharmacies list (Admin Only)
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
- `status` (optional): string
**Response:**
```json
{
  "success": true,
  "data": {
    "pharmacies": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "address": "string",
        "region": "string",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastLoginAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 120,
      "totalPages": 12
    }
  }
}
```

### GET /admin/suppliers
**Description:** Get suppliers list (Admin Only)
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
- `status` (optional): string
**Response:**
```json
{
  "success": true,
  "data": {
    "suppliers": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "companyName": "string",
        "specialty": "string",
        "status": "active|inactive",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastLoginAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 30,
      "totalPages": 3
    }
  }
}
```

### GET /admin/accounts/:id
**Description:** Get specific account (Admin Only)
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "PHARMACIE",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /admin/accounts/:id
**Description:** Update account (Admin Only)
**Parameters:**
- `id`: string
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "status": "ACTIVE"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "status": "ACTIVE"
  },
  "message": "Account updated successfully"
}
```

### POST /admin/accounts/:id/activate
**Description:** Activate account (Admin Only)
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "message": "Account activated successfully"
}
```

### POST /admin/accounts/:id/deactivate
**Description:** Deactivate account (Admin Only)
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "message": "Account deactivated successfully"
}
```

### POST /admin/accounts/:id/reset-password
**Description:** Reset account password (Admin Only)
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

---

## 🏥 Pharmacy Management Endpoints

### GET /pharmacies
**Description:** Get pharmacies
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
- `status` (optional): string
**Response:**
```json
{
  "success": true,
  "data": {
    "pharmacies": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "address": "string",
        "region": "string",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastLoginAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 120,
      "totalPages": 12
    }
  }
}
```

### GET /pharmacies/:id
**Description:** Get specific pharmacy
**Parameters:**
- `id`: string
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "region": "string",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /pharmacies
**Description:** Create pharmacy
**Headers:** Authorization required
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "region": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "region": "string",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Pharmacy created successfully"
}
```

### PUT /pharmacies/:id
**Description:** Update pharmacy
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "region": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "region": "string"
  },
  "message": "Pharmacy updated successfully"
}
```

### DELETE /pharmacies/:id
**Description:** Delete pharmacy
**Parameters:**
- `id`: string
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "message": "Pharmacy deleted successfully"
}
```

---

## 💊 Admin Medicine Management Endpoints

### GET /admin/medicines
**Description:** Get all medicines (Admin Only)
**Query Parameters:**
- `page` (optional): number
- `limit` (optional): number
**Response:**
```json
{
  "success": true,
  "data": {
    "medicines": [
      {
        "id": "string",
        "dci": "string",
        "brandName": "string",
        "laboratoire": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1250,
      "totalPages": 125
    }
  }
}
```

### POST /admin/medicines/import
**Description:** Import medicines from Excel (Admin Only)
**Content-Type:** multipart/form-data
**Body:** FormData with Excel file
**Response:**
```json
{
  "success": true,
  "message": "Medicines imported successfully",
  "data": {
    "total": 150,
    "importedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /admin/medicines/import-history
**Description:** Get import history (Admin Only)
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "filename": "string",
      "total": 150,
      "importedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly error message"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute

## WebSocket Events

Real-time notifications are sent via WebSocket:

- `notification` - New notification
- `announcement_updated` - Announcement status changed
- `request_updated` - Request status changed
- `retour_updated` - Retour status changed