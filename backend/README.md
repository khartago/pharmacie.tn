# Pharmacie.tn Backend

A Node.js backend API built with TypeScript, Express, and Prisma for the Pharmacie.tn platform.

## 🚀 Features

- **TypeScript**: Full TypeScript support with strict type checking
- **Express.js**: Fast, unopinionated web framework
- **Prisma**: Type-safe database client and ORM
- **CORS**: Cross-origin resource sharing enabled
- **Environment Variables**: Configuration via dotenv
- **Hot Reload**: Development with nodemon and ts-node

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Database (PostgreSQL recommended for Prisma)

## 🛠️ Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Configure your environment variables in `.env`

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for hot reloading during development.

### Production Build
```bash
npm run build
npm start
```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled application
- `npm run db:migrate` - Create and apply database migrations
- `npm run db:seed` - Seed the database with initial data
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio for database management
- `npm test` - Run tests (to be implemented)

## 🌐 API Endpoints

### Health Endpoints
- `GET /` - Welcome message: "Pharmacie.tn backend running"
- `GET /health` - Health check endpoint
- `GET /health/db` - Database health check endpoint

### API Routes
All API routes are prefixed with `/api`:

- **Authentication**: `/api/auth` - Register, login, get current user
- **Pharmacies**: `/api/pharmacies` - CRUD operations, auto-create cities
- **Medicines**: `/api/medicines` - List, search, CRUD (admin)
- **Admin Medicines**: `/api/admin/medicines` - Import Excel files, get count (admin/supplier)
- **Announcements**: `/api/announcements` - CRUD, interest system, retour flow
- **Requests**: `/api/requests` - CRUD, response system for medicine shortages
- **Notifications**: `/api/notifications` - List, mark read, statistics
- **Support**: `/api/support` - Support ticket system

📖 **Full API Documentation**: See `API.md` for detailed endpoint documentation
📋 **Seed Data Documentation**: See `SEED_DATA.md` for test user credentials and seeded data
📊 **Medicine Import**: See `MEDICINE_IMPORT.md` for medicine list import functionality
📧 **Email System**: See `EMAIL_SYSTEM.md` for French email templates and account creation
🔍 **Audit Logging**: See `AUDIT_LOGGING.md` for security events and system monitoring

## 🗄️ Database Setup

This project uses Prisma as the ORM. To set up the database:

1. Configure your database URL in `.env`
2. Create and run migrations:
   ```bash
   npm run db:migrate
   ```
3. Seed the database with initial data:
   ```bash
   npm run db:seed
   ```

### Database Schema

The application includes the following models:
- **Users**: Pharmacies, suppliers, and administrators
- **Cities**: Tunisian cities with region enum values
- **Regions**: PostgreSQL enum with all 24 Tunisian governorates
- **Medicines**: Pharmaceutical products with DCI and ATC codes
- **Announcements**: Medicine availability and return system
- **Requests**: Medicine shortage requests
- **Subscriptions**: User subscription management
- **Notifications**: System notifications
- **Audit Logs**: Activity tracking
- **Support Tickets**: Customer support system

## 📁 Project Structure

```
backend/
├── src/
│   └── server.ts          # Main server entry point
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── dist/                  # Compiled JavaScript (generated)
├── node_modules/          # Dependencies
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
├── nodemon.json           # Nodemon configuration
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🔧 Configuration

The application can be configured using environment variables:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT signing secret

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License. 