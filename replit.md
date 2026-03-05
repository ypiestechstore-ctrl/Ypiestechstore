# Computer Store

## Overview
A Next.js e-commerce application for a computer/tech store with product catalog, shopping cart, checkout, quotes, invoices, and admin dashboard.

## Tech Stack
- **Framework**: Next.js 15.5.12 (App Router, React 19)
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS v4
- **UI**: Radix UI components, Framer Motion animations
- **Language**: TypeScript
- **AI**: OpenAI via Replit AI Integrations (product description generation)

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (cart, catalog, home, layout, product, ui)
- `src/context/` - React context providers (auth)
- `src/lib/` - Utility libraries (prisma client)
- `prisma/` - Prisma schema and seed files
- `public/` - Static assets and uploaded images

## Key Features
- **AI Product Descriptions**: `/api/generate-description` uses OpenAI (gpt-5-mini) to generate accurate short and long descriptions based on product name and category
- **Admin Panel**: Responsive sidebar with mobile hamburger menu, role-based access (super-admin, admin, customer)
- **Authentication**: Real credential validation via `/api/auth/login` against PostgreSQL

## Database
- PostgreSQL (converted from original MySQL)
- Prisma ORM with models: Product, ProductImage, Category, User, Order, OrderItem, Quote, QuoteItem, Invoice, SerialNumber, BankDetail

## Environment Variables
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI API base URL (auto-set by Replit)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key (auto-set by Replit)
- `DATABASE_URL` - PostgreSQL connection string

## Development
- Dev server: `npx next dev -H 0.0.0.0 -p 5000`
- Database push: `npx prisma db push`
- Prisma client generation: `npx prisma generate`

## Deployment
- Build: `npm run build`
- Start: `npm run start`
- Output mode: standalone
