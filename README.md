# Rasa Bar Management System

A modern Restaurant POS system built with React, TypeScript, and Supabase. Features sales tracking, expense management, inventory control, loan management, and comprehensive reporting.

## Features

- **Sales Management**: Track orders, payments, and daily sales metrics
- **Menu Management**: Manage menu items, categories, pricing, and availability
- **Expense Tracking**: Categorize and track business expenses with daily summaries
- **Investment Management**: Track business investments and returns
- **Loan Management**: Track business loans with payment history and repayment tracking
- **Real-time Dashboard**: Live metrics for sales, expenses, and financial overview
- **Reports**: Comprehensive financial reporting and analytics

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: Lucide Icons, Tailwind CSS
- **State Management**: React Hooks

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Rasa Bar Management System"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these values from your Supabase project settings:
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Navigate to Settings → API
- Copy the Project URL and anon public API key

### 4. Set up the database

Run the SQL schema in Supabase SQL Editor:

```sql
-- Run the contents of supabase_schema.sql
-- This will create all required tables:
-- menu_items, sales, expenses, investments, loans, loan_payments
```

Optionally, run `seed_menu_data.sql` to populate initial menu items.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Database Schema

The application uses the following Supabase tables:

- `menu_items`: Menu items with categories, pricing, and availability
- `sales`: Sales records with items, quantities, and payment methods
- `expenses`: Business expenses with categories and descriptions
- `investments`: Business investments and returns
- `loans`: Business loans with interest rates
- `loan_payments`: Loan repayment history

## Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Environment Variables for Production

Make sure to add the same environment variables in your deployment platform's settings.

## Project Structure

```
src/
├── app/
│   └── App.tsx          # Main application component
├── components/
│   └── SearchableDropdown.tsx  # Reusable dropdown component
├── lib/
│   └── supabase.ts      # Supabase client configuration
└── pages/
    ├── DashboardView.tsx
    ├── SalesView.tsx
    ├── ExpensesView.tsx
    ├── InvestmentsView.tsx
    ├── LoansView.tsx
    ├── MenuManagementView.tsx
    └── ReportsView.tsx
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new page components in `src/pages/`
2. Add navigation in `App.tsx`
3. Update database schema if needed
4. Test thoroughly before deploying

## Troubleshooting

### Database connection errors
- Verify your Supabase URL and anon key in `.env`
- Check that your Supabase project is active
- Ensure tables exist in your database

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors in your IDE
- Verify all imports are correct

## License

This project is proprietary software for Rasa Bar.

## Support

For issues or questions, please contact the development team.