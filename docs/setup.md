# Setup Guide

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd medical-records-system
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Setup environment variables**
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` file with your database credentials and other configurations.

4. **Setup database**
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
\`\`\`

5. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

The application will be available at `http://localhost:3000`

## Default Users

After seeding, you can login with these accounts:

- **Admin**: username: `admin`, password: `admin123`
- **Doctor**: username: `dr.ahmad`, password: `admin123`
- **Pharmacist**: username: `apoteker`, password: `admin123`
- **Staff**: username: `pegawai`, password: `admin123`

## Production Deployment

1. **Build the application**
\`\`\`bash
npm run build
\`\`\`

2. **Start production server**
\`\`\`bash
npm start
\`\`\`

## Testing

\`\`\`bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npx playwright test
\`\`\`

## Database Management

\`\`\`bash
# Open Prisma Studio
npm run db:studio

# Reset database
npx prisma db push --force-reset

# Generate new migration
npx prisma migrate dev --name migration_name
\`\`\`

## Features

- ✅ Role-based authentication (Admin, Doctor, Pharmacist, Staff)
- ✅ Patient management
- ✅ Visit scheduling
- ✅ Medical records (SOAP format)
- ✅ Medicine inventory
- ✅ Prescription management
- ✅ Staff attendance
- ✅ PDF export
- ✅ Real-time notifications
- ✅ Responsive design
- ✅ Dark mode support
- ✅ FHIR compliance
- ✅ File upload
- ✅ Dashboard analytics
