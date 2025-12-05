# 🔌 Supabase Setup Guide for BizStep

## ✅ What's Already Done

- ✅ Supabase client configured with your credentials
- ✅ Environment variables set up (`.env` file created)
- ✅ Custom React hooks created for data fetching
- ✅ Helper functions for all database operations
- ✅ `.env` added to `.gitignore` for security

## 📋 Next Steps

### 1. Install Supabase Package

Run this command in your terminal:

```bash
npm install
```

This will install `@supabase/supabase-js` that was added to your `package.json`.

### 2. Set Up Database Tables

1. Go to your Supabase dashboard: https://app.supabase.com/project/itegkamzyvjchhstmuao
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` file
5. Paste it into the SQL editor
6. Click **Run** to create all tables and policies

This will create:
- ✅ 11 database tables
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Proper foreign key relationships

### 3. Seed Business Types Data

You have two options:

#### Option A: Manual Insert (Recommended for now)
The app will continue using local data until you're ready to migrate.

#### Option B: Bulk Insert via SQL
Create a script to insert all 119 business types into the `business_types` table.

### 4. Test the Connection

Restart your dev server:

```bash
npm run dev
```

The Supabase client is now available throughout your app!

## 🎯 How to Use Supabase in Your Components

### Example 1: Fetch Business Types

```javascript
import { useBusinessTypes } from '../hooks/useSupabase'

export function Home() {
  const { data: businessTypes, isLoading, error } = useBusinessTypes()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {businessTypes?.map(business => (
        <div key={business.id}>{business.name}</div>
      ))}
    </div>
  )
}
```

### Example 2: Add Financial Record

```javascript
import { useAddFinancialRecord } from '../hooks/useSupabase'

export function Finances() {
  const addRecord = useAddFinancialRecord()
  
  const handleSubmit = async (data) => {
    try {
      await addRecord.mutateAsync({
        user_business_id: 1,
        type: 'OPEX',
        category: 'Rent',
        amount: 800,
        description: 'Monthly rent',
        date: '2024-12-01'
      })
      alert('Record added!')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }
  
  return <button onClick={handleSubmit}>Add Record</button>
}
```

### Example 3: User Authentication

```javascript
import { useAuth, useSignIn, useSignOut } from '../hooks/useSupabase'

export function AuthComponent() {
  const { data: user } = useAuth()
  const signIn = useSignIn()
  const signOut = useSignOut()
  
  const handleSignIn = async () => {
    await signIn.mutateAsync({
      email: 'user@example.com',
      password: 'password123'
    })
  }
  
  if (user) {
    return (
      <div>
        <p>Welcome, {user.email}</p>
        <button onClick={() => signOut.mutate()}>Sign Out</button>
      </div>
    )
  }
  
  return <button onClick={handleSignIn}>Sign In</button>
}
```

## 📚 Available Hooks

All hooks are in `src/hooks/useSupabase.js`:

### Business & Steps
- `useBusinessTypes()` - Get all business types
- `useBusinessType(id)` - Get single business type
- `useUserBusinesses(userId)` - Get user's businesses
- `useCreateUserBusiness()` - Create new business
- `useBusinessSteps(businessTypeId)` - Get roadmap steps
- `useStepProgress(userBusinessId)` - Get step completion status
- `useToggleStepCompletion()` - Mark step as complete/incomplete

### Finances
- `useFinancialRecords(userBusinessId)` - Get business finances
- `useAddFinancialRecord()` - Add CAPEX/OPEX/Revenue record
- `usePersonalIncome(userId)` - Get personal income sources
- `usePersonalExpenses(userId)` - Get personal expenses
- `useAddPersonalExpense()` - Add personal expense

### Savings & Loans
- `useSavingsGoals(userId)` - Get savings goals
- `useCreateSavingsGoal()` - Create new savings goal
- `useLenders()` - Get available lenders

### Authentication
- `useAuth()` - Get current user
- `useSignUp()` - Register new user
- `useSignIn()` - Login user
- `useSignOut()` - Logout user

## 🔐 Authentication Setup (Optional)

Enable email authentication in Supabase:

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Users can now sign up and log in

## 🔒 Security Notes

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Users can only access their own data
- ✅ Business types and lenders are publicly readable
- ✅ Environment variables are in `.gitignore`
- ⚠️ Never commit `.env` file to Git
- ⚠️ Never share your Supabase keys publicly

## 🚀 Going to Production

When ready to deploy:

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Use the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Consider enabling additional security features in Supabase

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Restart your dev server after creating `.env`
- Check that variable names start with `VITE_`

### "relation does not exist"
- Run the SQL schema in Supabase SQL Editor
- Make sure all tables were created successfully

### "row-level security policy violation"
- Make sure you're authenticated (if required)
- Check that RLS policies were created
- Verify user_id matches authenticated user

## ✨ Your Supabase Project

- **Project URL**: https://itegkamzyvjchhstmuao.supabase.co
- **Dashboard**: https://app.supabase.com/project/itegkamzyvjchhstmuao
- **Status**: ✅ Connected and ready to use!

---

Need help? Check the Supabase docs or ask for assistance! 🚀
