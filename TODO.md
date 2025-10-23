# 🚀 Pharmacie.tn - Project Finalization TODO

## 📋 Project Overview
Complete the full-stack Pharmacie.tn platform with real-time notifications, advanced analytics, and role-based dashboards.

---

## 🔹 PART 1 — Backend Features (Priority: HIGH)

### ✅ Step 1 — Notifications (Real-Time)
- [ ] **Install Socket.IO dependencies**
  ```bash
  npm install socket.io @types/socket.io
  ```
- [ ] **Create Socket.IO server setup**
  - [ ] `backend/src/services/socketService.ts`
  - [ ] Integrate with Express app
  - [ ] Authentication middleware for sockets
- [ ] **Notification events**
  - [ ] Interest expressed/accepted/refused on annonces
  - [ ] Request created/responded/accepted
  - [ ] Retour created/accepted/refused
  - [ ] Expiration of annonces or requests
- [ ] **Client subscription system**
  - [ ] Subscribe per `userId`
  - [ ] Room-based notifications
  - [ ] Real-time updates

### ✅ Step 2 — Archiving System
- [ ] **Archive endpoints**
  - [ ] `POST /api/announcements/archive` - Archive expired announcements
  - [ ] `POST /api/requests/archive` - Archive expired requests
  - [ ] `POST /api/retours/archive` - Archive expired retours
- [ ] **Archive management**
  - [ ] `GET /api/announcements/archived` - List archived items
  - [ ] `POST /api/announcements/restore/:id` - Restore from archive
  - [ ] CSV export for archived items
- [ ] **Automatic archiving**
  - [ ] Cron job for expired items
  - [ ] Notification before expiration

### ✅ Step 3 — Advanced Analytics (Admin)
- [ ] **Analytics endpoints**
  - [ ] `GET /api/admin/analytics/top-medicines` - Most requested medicines
  - [ ] `GET /api/admin/analytics/requests-by-region` - Regional statistics
  - [ ] `GET /api/admin/analytics/announcements-trend` - Time-based trends
  - [ ] `GET /api/admin/analytics/active-pharmacies` - Active pharmacy stats
  - [ ] `GET /api/admin/analytics/active-suppliers` - Active supplier stats
- [ ] **Filter support**
  - [ ] Last 7 days, 30 days, 6 months
  - [ ] Date range filters
  - [ ] Regional filters
- [ ] **Chart data format**
  - [ ] JSON response with labels + values
  - [ ] Compatible with Chart.js/Recharts

### ✅ Step 4 — Export System
- [ ] **PDF exports**
  - [ ] Fournisseur retours acceptés
  - [ ] Use PDF generation library (puppeteer/html-pdf)
- [ ] **CSV exports**
  - [ ] Pharmacies list
  - [ ] Fournisseurs list
  - [ ] Annonces history
  - [ ] Demandes history
  - [ ] Support tickets
  - [ ] Audit logs
- [ ] **Export endpoints**
  - [ ] `GET /api/admin/export/pharmacies`
  - [ ] `GET /api/admin/export/fournisseurs`
  - [ ] `GET /api/admin/export/annonces`
  - [ ] `GET /api/admin/export/demandes`
  - [ ] `GET /api/admin/export/support`
  - [ ] `GET /api/admin/export/audit`

---

## 🔹 PART 2 — Frontend Setup (Priority: HIGH)

### ✅ Step 5 — API Centralization
- [ ] **Update `frontend/src/lib/api.ts`**
  - [ ] Add `fetcher` utility function
  - [ ] Prefix with `process.env.NEXT_PUBLIC_API_URL`
  - [ ] Auto-attach `Authorization` header
  - [ ] Handle JSON parsing and errors
- [ ] **Create API namespaces**
  - [ ] `AnnouncementsAPI` - CRUD operations
  - [ ] `RequestsAPI` - CRUD operations
  - [ ] `RetoursAPI` - CRUD operations
  - [ ] `MedicinesAPI` - Search and management
  - [ ] `NotificationsAPI` - Real-time notifications
  - [ ] `SupportAPI` - Ticket management
  - [ ] `AccountsAPI` - User management
  - [ ] `AnalyticsAPI` - Admin analytics
- [ ] **Remove all inline fetch calls**
  - [ ] Audit all components
  - [ ] Replace with API helpers

### ✅ Step 6 — Dashboard Layout
- [ ] **Create `frontend/src/components/DashboardLayout.tsx`**
  - [ ] Sidebar with role-based navigation
  - [ ] Topbar with notification bell, profile, logout
  - [ ] Responsive design (mobile-friendly)
  - [ ] Collapsible sidebar
- [ ] **Role-based navigation**
  - [ ] Pharmacie: Dashboard, Annonces, Demandes, Notifications, Profil, Support
  - [ ] Fournisseur: Dashboard, Retours, Demandes, Notifications, Profil, Support
  - [ ] Admin: Dashboard, Pharmacies, Fournisseurs, Comptes, Annonces, Demandes, Médicaments, Audit, Support, Analytics

### ✅ Step 7 — Reusable Components
- [ ] **Create `frontend/src/components/ui/Table.tsx`**
  - [ ] Search functionality
  - [ ] Filters (date, status, region)
  - [ ] Pagination
  - [ ] Status badges
  - [ ] Sortable columns
- [ ] **Create `frontend/src/components/ui/Tabs.tsx`**
  - [ ] Disponibles / Mes éléments / Archives
  - [ ] Tab switching
  - [ ] URL state management
- [ ] **Create `frontend/src/components/ui/Chart.tsx`**
  - [ ] Chart.js wrapper
  - [ ] Line, bar, pie charts
  - [ ] Responsive design
- [ ] **Create `frontend/src/components/ui/NotificationDropdown.tsx`**
  - [ ] Real-time notifications
  - [ ] Mark as read
  - [ ] Notification grouping
- [ ] **Create `frontend/src/components/ui/ExportButton.tsx`**
  - [ ] CSV download
  - [ ] PDF download
  - [ ] Loading states

---

## 🔹 PART 3 — Dashboards (Priority: HIGH)

### ✅ Step 8 — Pharmacie Dashboard
- [ ] **Dashboard page (`/dashboard/pharmacie`)**
  - [ ] Stats cards (annonces actives, disponibles, demandes, notifications)
  - [ ] Activity chart
  - [ ] Recent activity feed
- [ ] **Annonces page (`/dashboard/pharmacie/annonces`)**
  - [ ] Tab: Disponibles (view, express interest)
  - [ ] Tab: Mes annonces (create, edit, delete)
  - [ ] Tab: Archives (view archived)
  - [ ] Create/Edit forms
  - [ ] Status management
- [ ] **Demandes page (`/dashboard/pharmacie/demandes`)**
  - [ ] Tab: Disponibles (view, respond)
  - [ ] Tab: Mes demandes (create, edit, delete)
  - [ ] Tab: Archives
  - [ ] Create/Edit forms
- [ ] **Notifications page (`/dashboard/pharmacie/notifications`)**
  - [ ] Real-time updates
  - [ ] Filter by type
  - [ ] Mark as read
  - [ ] Group by date
- [ ] **Profil page (`/dashboard/pharmacie/profil`)**
  - [ ] User information
  - [ ] Subscription pack details
  - [ ] Password change
- [ ] **Support page (`/dashboard/pharmacie/support`)**
  - [ ] Create tickets
  - [ ] View ticket history
  - [ ] Ticket status tracking

### ✅ Step 9 — Fournisseur Dashboard
- [ ] **Dashboard page (`/dashboard/fournisseur`)**
  - [ ] Stats cards (retours visibles, acceptés, demandes, notifications)
  - [ ] Activity chart
  - [ ] Recent activity feed
- [ ] **Retours page (`/dashboard/fournisseur/retours`)**
  - [ ] Tab: Disponibles (view, accept/refuse)
  - [ ] Tab: Mes retours acceptés (view, export PDF)
  - [ ] Tab: Archives
  - [ ] PDF export functionality
- [ ] **Demandes page (`/dashboard/fournisseur/demandes`)**
  - [ ] Tab: Disponibles (view, respond)
  - [ ] Tab: Mes réponses (view responses)
  - [ ] Tab: Archives
- [ ] **Notifications page (`/dashboard/fournisseur/notifications`)**
  - [ ] Real-time updates
  - [ ] Filter by type
  - [ ] Mark as read
- [ ] **Profil page (`/dashboard/fournisseur/profil`)**
  - [ ] Company information
  - [ ] Contact details
  - [ ] Password change
- [ ] **Support page (`/dashboard/fournisseur/support`)**
  - [ ] Create tickets
  - [ ] View ticket history

### ✅ Step 10 — Admin Dashboard
- [ ] **Dashboard page (`/dashboard/admin`)**
  - [ ] Stats cards (pharmacies actives, fournisseurs, annonces, demandes)
  - [ ] Trend charts (annonces/demandes)
  - [ ] Health check widget
  - [ ] System status
- [ ] **Pharmacies page (`/dashboard/admin/pharmacies`)**
  - [ ] List all pharmacies
  - [ ] Filters (status, region, date)
  - [ ] Activate/deactivate
  - [ ] Reset password
  - [ ] Export CSV
- [ ] **Fournisseurs page (`/dashboard/admin/fournisseurs`)**
  - [ ] List all suppliers
  - [ ] Filters and management
  - [ ] Export CSV
- [ ] **Comptes page (`/dashboard/admin/comptes`)**
  - [ ] Global user view
  - [ ] Statistics
  - [ ] CSV export
- [ ] **Annonces & Demandes page (`/dashboard/admin/annonces-demandes`)**
  - [ ] Consolidated view
  - [ ] Tabs for each type
  - [ ] Archives management
  - [ ] CSV export
- [ ] **Médicaments page (`/dashboard/admin/medicines`)**
  - [ ] Upload Excel files
  - [ ] View medicine count
  - [ ] Import history
  - [ ] Search and filter
- [ ] **Audit Logs page (`/dashboard/admin/audit`)**
  - [ ] List all audit entries
  - [ ] Filters (user, action, date)
  - [ ] CSV export
- [ ] **Support page (`/dashboard/admin/support`)**
  - [ ] Assign tickets
  - [ ] Respond to tickets
  - [ ] Set priority
  - [ ] Ticket management
- [ ] **Advanced Analytics page (`/dashboard/admin/analytics`)**
  - [ ] Top 10 demanded medicines chart
  - [ ] Requests by region chart
  - [ ] Announcements/demandes trend (line chart)
  - [ ] Most active pharmacies chart
  - [ ] Most active suppliers chart
  - [ ] CSV/PDF export options
- [ ] **Profil page (`/dashboard/admin/profil`)**
  - [ ] Admin information
  - [ ] System settings

---

## 🔹 PART 4 — Final Checks (Priority: MEDIUM)

### ✅ Step 11 — Responsiveness
- [ ] **Mobile optimization**
  - [ ] All layouts responsive
  - [ ] Sidebar collapsible on mobile
  - [ ] Tables scrollable horizontally
  - [ ] Touch-friendly interactions
- [ ] **Tablet optimization**
  - [ ] Medium screen layouts
  - [ ] Touch gestures
- [ ] **Desktop optimization**
  - [ ] Full feature access
  - [ ] Keyboard shortcuts

### ✅ Step 12 — Quality Assurance
- [ ] **End-to-end testing**
  - [ ] Pharmacie creates annonce → appears in disponibles
  - [ ] Interest → owner notified in real time
  - [ ] Request → responders notified
  - [ ] Retour → supplier notified → accept/refuse → pharmacy notified
  - [ ] Expired → moves to archive automatically
  - [ ] Admin → import meds, manage accounts, export data, analytics
- [ ] **Error handling**
  - [ ] Network errors
  - [ ] Validation errors
  - [ ] Server errors
  - [ ] User-friendly error messages
- [ ] **Performance testing**
  - [ ] Page load times
  - [ ] API response times
  - [ ] Real-time updates performance

### ✅ Step 13 — Cleanup & Documentation
- [ ] **Code cleanup**
  - [ ] Remove all inline fetch calls
  - [ ] Verify all API calls use `lib/api.ts`
  - [ ] Remove unused imports
  - [ ] Consistent code formatting
- [ ] **Environment setup**
  - [ ] Ensure `.env` has `NEXT_PUBLIC_API_URL=http://localhost:3000/api`
  - [ ] Document all environment variables
  - [ ] Create `.env.example`
- [ ] **Documentation**
  - [ ] API documentation
  - [ ] Component documentation
  - [ ] Setup instructions
  - [ ] Deployment guide

---

## 🔹 PART 5 — Additional Features (Priority: LOW)

### ✅ Step 14 — Enhanced Features
- [ ] **Search functionality**
  - [ ] Global search across all entities
  - [ ] Advanced filters
  - [ ] Search history
- [ ] **Bulk operations**
  - [ ] Bulk export
  - [ ] Bulk status updates
  - [ ] Bulk delete (admin only)
- [ ] **Data visualization**
  - [ ] Interactive charts
  - [ ] Data tables with sorting
  - [ ] Export to Excel
- [ ] **User experience**
  - [ ] Loading skeletons
  - [ ] Optimistic updates
  - [ ] Offline support
  - [ ] Progressive Web App features

---

## 📝 Implementation Notes

### Environment Variables Required
```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Backend
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=no-reply@pharmacie.tn
ADMIN_EMAIL=admin@pharmacie.tn
```

### Dependencies to Install
```bash
# Backend
npm install socket.io @types/socket.io
npm install puppeteer html-pdf
npm install node-cron @types/node-cron

# Frontend
npm install chart.js react-chartjs-2
npm install recharts
npm install @headlessui/react
npm install react-hot-toast
```

### File Structure
```
frontend/src/
├── components/
│   ├── DashboardLayout.tsx
│   └── ui/
│       ├── Table.tsx
│       ├── Tabs.tsx
│       ├── Chart.tsx
│       ├── NotificationDropdown.tsx
│       └── ExportButton.tsx
├── lib/
│   └── api.ts (enhanced)
└── app/
    └── dashboard/
        ├── pharmacie/
        ├── fournisseur/
        └── admin/

backend/src/
├── services/
│   └── socketService.ts
├── controllers/
│   ├── analyticsController.ts
│   ├── exportController.ts
│   └── archiveController.ts
└── routes/
    ├── analytics.ts
    ├── export.ts
    └── archive.ts
```

---

## 🎯 Success Criteria

- [ ] All API calls go through `lib/api.ts`
- [ ] Real-time notifications work
- [ ] All dashboards are functional and responsive
- [ ] Export functionality works (CSV/PDF)
- [ ] Analytics display correctly
- [ ] Role-based access control works
- [ ] Mobile responsiveness achieved
- [ ] No inline fetch calls remain
- [ ] Environment variables properly configured

---

## ⚡ Quick Start Commands

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Database (if using Docker)
docker-compose up -d
```

---

**Estimated Completion Time: 2-3 weeks**
**Priority Order: Backend → Frontend Setup → Dashboards → QA → Cleanup** 