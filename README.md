# Open Forms

An advanced form builder application enabling users to create, manage, and analyze dynamic forms with comprehensive export/import capabilities and intuitive design.

## Features

- **Drag & Drop Form Builder**: Intuitive interface with 60+ field types across 10 categories
- **Multi-Column Layouts**: Flexible row-based layouts with responsive design
- **Live Preview**: Real-time form preview with mobile, tablet, and desktop views
- **Share & Publish**: Generate shareable links for public form submissions
- **Data Export**: PDF export and JSON serialization for form backup/transfer
- **Response Analytics**: View and analyze form submissions with export capabilities
- **Three-Tier Subscription System**: Free, Core ($20/month), and Premium ($50/month) plans
- **REST API**: Full API access for Premium subscribers with Swagger documentation
- **Dark/Light Theme**: Complete theme system with user preferences
- **Mobile Responsive**: Optimized for all screen sizes and devices

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Express.js + TypeScript, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Custom session-based auth with secure cookies
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- npm or yarn package manager

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd open-forms
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/openforms
PGHOST=localhost
PGPORT=5432
PGDATABASE=openforms
PGUSER=your_username
PGPASSWORD=your_password

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Application Configuration
NODE_ENV=development
PORT=3000

# Optional: Stripe Integration (for subscription payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

### 4. Database Setup

#### Option A: Using Replit Database (Recommended for Replit environment)
The database will be automatically configured if running on Replit.

#### Option B: Local PostgreSQL Setup
1. Install PostgreSQL on your system
2. Create a new database:
```sql
CREATE DATABASE openforms;
```
3. Update the `DATABASE_URL` in your `.env` file

### 5. Initialize Database Schema

Push the database schema to your PostgreSQL instance:

```bash
npm run db:push
```

This command will:
- Create all necessary tables (users, forms, form_responses, sessions, user_sessions)
- Set up proper relationships and indexes
- Initialize the database for first use

## Development

### Start Development Server

```bash
npm run dev
```

This will start both the Express backend and Vite frontend development servers. The application will be available at `http://localhost:3000`.

### Available Scripts

- `npm run dev` - Start development servers (frontend + backend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run type-check` - Run TypeScript type checking

## Production Build

### 1. Build the Application

```bash
npm run build
```

This creates optimized production builds:
- Client build in `dist/` directory
- Server TypeScript compiled to JavaScript

### 2. Environment Variables for Production

Ensure these environment variables are set in your production environment:

```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
SESSION_SECRET=your_production_session_secret
PORT=3000

# Optional Production Variables
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
```

### 3. Start Production Server

```bash
npm start
```

Or using PM2 for process management:

```bash
npm install -g pm2
pm2 start npm --name "open-forms" -- start
```

### 4. Database Migration for Production

Before starting the production server, ensure your database schema is up to date:

```bash
npm run db:push
```

## Deployment

### Replit Deployment (Recommended)

1. Import this repository into Replit
2. Replit will automatically detect the configuration
3. Set required environment variables in Replit's Secrets tab:
   - `SESSION_SECRET`
   - Database variables (automatically provided by Replit PostgreSQL)
   - Optional: Stripe keys for payment processing
4. Click "Run" to start the development server
5. Use Replit's deployment feature for production hosting

### Manual Deployment

For deployment to other platforms (Heroku, DigitalOcean, AWS, etc.):

1. Ensure all environment variables are configured
2. Set up a PostgreSQL database
3. Run the build process: `npm run build`
4. Start the production server: `npm start`

## Subscription Tiers

### Free Tier
- 3 forms maximum
- 150 responses per month
- Basic form builder features
- Email support

### Core Tier ($20/month)
- 500 forms maximum
- 10,000 responses per month
- Advanced form builder features
- Premium templates
- Priority support

### Premium Tier ($50/month)
- Unlimited forms
- Unlimited responses
- Full REST API access
- Advanced analytics
- White-label options
- 24/7 priority support

## API Documentation

Premium subscribers can access the full REST API documentation at `/api/docs` when logged in. The API provides programmatic access to:

- Form management (CRUD operations)
- Response data retrieval
- User account management
- Subscription status

## Architecture

### Frontend Structure
```
client/src/
├── components/     # Reusable UI components
├── pages/         # Application pages
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
└── App.tsx        # Main application component
```

### Backend Structure
```
server/
├── routes.ts      # API route definitions
├── storage.ts     # Database abstraction layer
├── auth-storage.ts # Authentication storage methods
├── subscription-service.ts # Subscription logic
└── index.ts       # Express server setup
```

### Shared Schema
```
shared/
└── schema.ts      # Database schema and TypeScript types
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running and accessible
- Check firewall settings for database connections

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version is 18 or higher
- Check for TypeScript errors: `npm run type-check`

### Session Issues
- Verify `SESSION_SECRET` is set and secure
- Clear browser cookies and session data
- Check that database sessions table exists

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@openforms.ca
- Documentation: Available in-app for Premium subscribers
- Community: GitHub Issues for bug reports and feature requests