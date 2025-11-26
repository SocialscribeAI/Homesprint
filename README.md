# HomeSprint 🏠

A modern rental property platform connecting property seekers with verified listings in Jerusalem and beyond. Built with Next.js, Supabase, and TypeScript in a monorepo architecture.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Supabase** account for database and authentication

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd homesprint

# Install dependencies
pnpm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
JWT_SECRET=generate-a-secure-random-string-here
```

4. Set up the database schema by following the [Supabase Setup Guide](./SUPABASE_SETUP.md)

### 3. Set up the Database

```bash
# Generate Prisma client
pnpm db:generate

# Push the schema to your database
pnpm db:push

# Seed with sample data
pnpm db:seed
```

### 4. Start Development

```bash
# Start the development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
homesprint/
├── apps/
│   ├── web/                 # Next.js web application
│   └── admin/               # Admin dashboard (future)
├── packages/
│   ├── config/              # Shared configuration (ESLint, TypeScript, Tailwind)
│   ├── db/                  # Database schema and migrations (Prisma)
│   ├── ui/                  # Shared UI components and design system
│   ├── payments/            # Payment processing (Stripe)
│   └── schemas/             # Data validation schemas
├── infra/                   # Infrastructure as code (Terraform, Vercel)
├── docs/                    # Architecture and feature documentation
└── SUPABASE_SETUP.md        # Database setup guide
```

## 🛠️ Available Scripts

### Root Level Scripts

```bash
pnpm dev              # Start development server
pnpm build           # Build all packages and apps
pnpm lint            # Run linting across the monorepo

# Database commands
pnpm db:generate     # Generate Prisma client
pnpm db:push         # Push schema changes to database
pnpm db:migrate      # Run database migrations
pnpm db:studio       # Open Prisma Studio
pnpm db:seed         # Seed database with sample data
```

### Package-Specific Scripts

```bash
# Web app
cd apps/web && pnpm dev

# Database
cd packages/db && pnpm db:studio
```

## 🏗️ Architecture

HomeSprint follows a modular monorepo architecture:

- **Apps**: Deployable applications (web platform, admin dashboard)
- **Packages**: Shared libraries and utilities
- **Infra**: Infrastructure configuration and deployment

### Tech Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Custom OTP-based authentication
- **Payments**: Stripe integration
- **Deployment**: Vercel
- **Development**: pnpm workspaces, Turbo monorepo, ESLint

## 🔧 Development Workflow

### Adding a New Feature

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes following the existing code patterns
3. Run tests and linting: `pnpm lint`
4. Test your changes locally: `pnpm dev`
5. Commit with conventional commits: `git commit -m "feat: add new feature"`
6. Push and create a PR

### Database Changes

1. Update the Prisma schema in `packages/db/prisma/schema.prisma`
2. Generate migrations: `pnpm db:generate`
3. Push to database: `pnpm db:push`
4. Update seed data if needed in `packages/db/seed/`

### UI Components

- Shared components live in `packages/ui/src/components/`
- Follow the existing design system and component patterns
- Use the Button component as a reference for new components

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE.md)
- [Authentication](./docs/AUTHENTICATION.md)
- [API Layer](./docs/API_LAYER.md)
- [Supabase Setup](./SUPABASE_SETUP.md)

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Write clear commit messages
3. Update documentation for new features
4. Test your changes thoroughly

## 📄 License

This project is private and proprietary to HomeSprint.
