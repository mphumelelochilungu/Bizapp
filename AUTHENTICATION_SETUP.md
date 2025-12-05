# 🔐 Authentication & Role-Based Access Control Setup

## Overview

BizStep now has a complete authentication system with role-based access control:
- **Landing Page** - Public homepage explaining the app
- **Login/Register** - User authentication
- **User Role** - Access to all business features
- **Admin Role** - Access to everything + admin panel

## 🚀 Quick Start

### 1. Enable Email Authentication in Supabase

1. Go to your Supabase dashboard: https://app.supabase.com/project/itegkamzyvjchhstmuao
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. Configure email templates (optional)

### 2. Run Database Schema

Make sure you've run the `supabase-schema.sql` in your SQL Editor.

### 3. Test the App

```bash
npm run dev
```

Visit `http://localhost:5173`

## 📋 User Flow

### For New Users:
1. Visit landing page at `/`
2. Click "Get Started" or "Sign Up"
3. Fill registration form
4. Account created with `role: 'user'`
5. Redirected to `/login`
6. Sign in and access `/dashboard`

### For Existing Users:
1. Visit landing page at `/`
2. Click "Sign In"
3. Enter credentials
4. Access `/dashboard` and all user features

### For Admins:
1. Register as normal user first
2. Admin upgrades account via SQL (see below)
3. Sign in to access admin panel
4. See "Admin Panel" button in sidebar
5. Access all admin features

## 👤 User Roles

### Regular User (`role: 'user'`)
**Has access to:**
- ✅ Dashboard / Home
- ✅ My Business
- ✅ Finances
- ✅ Reports
- ✅ Bank Accounts
- ✅ Loans & Savings
- ✅ Wallet Planner
- ✅ Business Plans
- ✅ Profile

**Does NOT see:**
- ❌ Admin Panel button
- ❌ Admin menu items
- ❌ Admin routes

### Admin User (`role: 'admin'`)
**Has access to:**
- ✅ Everything users have
- ✅ Admin Panel button in sidebar
- ✅ Manage Business Types
- ✅ Manage Steps
- ✅ Manage Lenders
- ✅ Test Supabase
- ✅ SQL Setup

## 🔧 Creating Admin Users

### Method 1: Via SQL (Recommended)

1. User registers through the app first
2. Go to Supabase SQL Editor
3. Run this command (replace email):

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@bizstep.com';
```

4. Verify the update:

```sql
SELECT 
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'admin@bizstep.com';
```

5. User logs out and logs back in to see admin features

### Method 2: Use the SQL File

Run `create-admin-users.sql` in Supabase SQL Editor and follow instructions.

## 🛡️ Route Protection

### Public Routes (No Auth Required)
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Auth Required)
- `/dashboard` - User home
- `/mybusiness` - Business management
- `/finances` - Financial tracking
- `/reports` - Reports
- `/bank-accounts` - Bank connections
- `/loans` - Loans & savings
- `/wallet` - Personal finance
- `/business-plans` - Business planning
- `/profile` - User profile

### Admin Routes (Admin Role Required)
- `/admin/business-types` - Manage business catalog
- `/admin/steps` - Manage roadmap steps
- `/admin/lenders` - Manage lenders
- `/admin/test-supabase` - Test database connection
- `/admin/sql-setup` - SQL schema setup

## 🔐 Security Features

1. **Row Level Security (RLS)** - Enabled on all tables
2. **Role-Based Access** - Admin routes check user role
3. **Protected Routes** - Redirect to login if not authenticated
4. **Secure Passwords** - Minimum 6 characters
5. **Email Verification** - Can be enabled in Supabase settings

## 📱 Pages Overview

### Landing Page (`/`)
- Hero section with app description
- Feature highlights
- Benefits list
- Call-to-action buttons
- Login/Register links

### Login Page (`/login`)
- Email/password form
- Error handling
- Link to registration
- Demo credentials hint

### Register Page (`/register`)
- Full name, email, password fields
- Password confirmation
- Success message
- Auto-redirect to login

### Dashboard (`/dashboard`)
- Same as Home page
- Shows business types catalog
- Search and filter functionality

## 🧪 Testing

### Test as Regular User:
1. Register: `user@test.com` / `password123`
2. Login and verify no admin access
3. Check sidebar - no admin options

### Test as Admin:
1. Register: `admin@test.com` / `password123`
2. Run SQL to upgrade to admin
3. Logout and login again
4. Check sidebar - admin panel visible
5. Access admin routes

## 🔄 User Role Management

### Check User Roles:
```sql
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```

### Upgrade to Admin:
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'user@example.com';
```

### Downgrade to User:
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"user"'
)
WHERE email = 'admin@example.com';
```

## 🚨 Troubleshooting

### "Not authorized" when accessing admin routes
- Make sure user has `role: 'admin'` in metadata
- Logout and login again after role change
- Check SQL update was successful

### Can't see admin panel button
- Verify user role in database
- Clear browser cache
- Check `useAuth()` hook is working

### Redirect loop on login
- Check `.env` file has correct Supabase credentials
- Verify authentication is enabled in Supabase
- Check browser console for errors

## 📚 Code Structure

```
src/
├── pages/
│   ├── Landing.jsx          # Public landing page
│   ├── Login.jsx            # Login form
│   ├── Register.jsx         # Registration form
│   ├── Dashboard.jsx        # User home (protected)
│   └── admin/               # Admin pages (admin only)
├── components/
│   ├── ProtectedRoute.jsx   # Route protection wrapper
│   └── Layout.jsx           # Main layout with role-based nav
└── hooks/
    └── useSupabase.js       # Auth hooks (useAuth, useSignIn, etc.)
```

## ✨ Features

- ✅ Beautiful landing page
- ✅ Secure authentication
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Admin panel
- ✅ User/Admin separation
- ✅ SQL-based role management
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

---

**Your authentication system is ready!** 🎉

Users can register, login, and access features based on their role. Admins can be created via SQL and have full access to the admin panel.
