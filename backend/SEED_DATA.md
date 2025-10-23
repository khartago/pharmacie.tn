# Database Seed Data

This document describes the initial data that is seeded into the database when running `npm run seed`.

## 🌱 Seeded Data

### Roles
- **ADMIN** - System administrators with full access
- **PHARMACY** - Pharmacy users who can manage medicines and announcements
- **SUPPLIER** - Supplier users who can respond to requests

### Regions (24 Tunisian Governorates)
Regions are now defined as PostgreSQL enum values in the schema:

- **TUNIS** - Tunis
- **ARIANA** - Ariana  
- **BEN_AROUS** - Ben Arous
- **MANOUBA** - Manouba
- **NABEUL** - Nabeul
- **ZAGHOUAN** - Zaghouan
- **BIZERTE** - Bizerte
- **BEJA** - Béja
- **JENDOUBA** - Jendouba
- **KEF** - Kef
- **SILIANA** - Siliana
- **SOUSSE** - Sousse
- **MONASTIR** - Monastir
- **MAHDIA** - Mahdia
- **SFAX** - Sfax
- **KAIROUAN** - Kairouan
- **KASSERINE** - Kasserine
- **SIDI_BOUZID** - Sidi Bouzid
- **GABES** - Gabès
- **MEDENINE** - Médenine
- **TATAOUINE** - Tataouine
- **GAFSA** - Gafsa
- **TOZEUR** - Tozeur
- **KEBILI** - Kébili

### Test Users

#### Admin User
- **Email**: `admin@pharmacie.tn`
- **Password**: `admin123`
- **Name**: System Administrator
- **Phone**: +216 71 000 000
- **Address**: 123 Admin Street, Tunis
- **Role**: ADMIN

#### Pharmacy User
- **Email**: `pharmacy@pharmacie.tn`
- **Password**: `pharmacy123`
- **Name**: Pharmacie Carthage
- **Phone**: +216 71 123 456
- **Address**: 456 Avenue Habib Bourguiba, Carthage
- **Role**: PHARMACY
- **City**: Carthage (auto-created in Tunis region)

#### Supplier User
- **Email**: `supplier@pharmacie.tn`
- **Password**: `supplier123`
- **Name**: Fournisseur Médical Plus
- **Phone**: +216 71 789 012
- **Address**: 789 Rue du Commerce, Tunis
- **Role**: SUPPLIER

## 🚀 Usage

### Running the Seed Scripts

#### First Seed Script (Basic Data)
```bash
npm run seed
# or
npm run db:seed
```

#### Second Seed Script (Medicine-Related Data)
```bash
npm run seed:medicine
```

**Note**: Run the second script only after importing medicine data manually.

### What Each Script Does

#### First Seed Script (`npm run seed`)
- Creates roles (ADMIN, PHARMACY, SUPPLIER)
- Seeds 30+ cities across all Tunisian regions
- Creates 32 test users (2 admins, 20 pharmacies, 10 suppliers)
- Generates subscriptions for all users
- Creates notifications, support tickets, and audit logs
- **No medicine data required**

#### Second Seed Script (`npm run seed:medicine`)
- Creates announcements (suppliers offering medicines)
- Generates interests (pharmacies interested in announcements)
- Creates medicine requests from pharmacies
- Generates request responses
- Creates medicine-related notifications and audit logs
- **Requires medicine data to be imported first**

### Testing the API
You can now test the API endpoints using these credentials:

#### Login Examples
```bash
# Admin login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@pharmacie.tn", "password": "admin123"}'

# Pharmacy login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "pharmacy@pharmacie.tn", "password": "pharmacy123"}'

# Supplier login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "supplier@pharmacie.tn", "password": "supplier123"}'
```

## 🔄 Re-seeding

The seed script uses `upsert` operations, so it's safe to run multiple times. It will:
- Create new records if they don't exist
- Update existing records if they already exist
- Maintain data integrity with unique constraints

## 📝 Notes

- All passwords are properly hashed using bcrypt with 12 salt rounds
- Email addresses are unique across all users
- The pharmacy user demonstrates the auto-city creation feature
- All users are set as active by default
- Phone numbers follow Tunisian format (+216)
- All API endpoints have been tested and verified working
- **Regions are now PostgreSQL enum values** - No separate regions table needed
- **Improved performance** - Direct enum access instead of foreign key lookups
- **Type safety** - Enum values are validated at the database level

## 🧪 Testing

You can test the API endpoints using the provided test credentials. All endpoints are working correctly:

- ✅ Health endpoints (`/health`, `/health/db`)
- ✅ Authentication endpoints (`/api/auth/login`, `/api/auth/me`)
- ✅ Protected endpoints (pharmacies, medicines, notifications, etc.)
- ✅ Role-based authorization working correctly 