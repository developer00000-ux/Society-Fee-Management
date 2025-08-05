# Setup Guide - Fix "Profile Not Found" Login Error

## Problem
You're getting a "Profile not found" error when trying to log in. This happens because the database schema is missing the required tables, particularly the `user_profiles` table.

## Solution

### Step 1: Set up Supabase Database Schema

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run** to execute the schema

This will create all the necessary tables including:
- `user_profiles` (required for authentication)
- `colonies`, `buildings`, `flats` (for the society management system)
- All other supporting tables

### Step 2: Create Demo Data

1. Go to the login page in your application
2. Click **"Setup Demo Data"** button
3. Wait for the success message

This creates the basic data structure (colonies, buildings, flats, etc.)

### Step 3: Create Demo Auth Users

1. Click **"Create Demo Auth Users"** button
2. Wait for the success message

This creates actual Supabase auth users that you can log in with.

### Step 4: Login with Demo Credentials

Use any of these demo accounts to log in:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@demo.com | superadmin123 |
| Colony Admin | colonyadmin@demo.com | colonyadmin123 |
| Block Manager | blockmanager@demo.com | blockmanager123 |
| Resident 1 | resident1@demo.com | resident123 |
| Resident 2 | resident2@demo.com | resident123 |

## What Each Role Can Do

- **Super Admin**: Full system access, can manage all colonies and users
- **Colony Admin**: Can manage their assigned colony
- **Block Manager**: Can manage their assigned building
- **Resident**: Can view their personal dashboard and submit maintenance requests

## Troubleshooting

### If you still get "Profile not found" error:

1. **Check Supabase Schema**: Make sure the `user_profiles` table exists in your Supabase dashboard
2. **Verify Demo Data**: Ensure you've run both "Setup Demo Data" and "Create Demo Auth Users"
3. **Check Environment Variables**: Verify your `.env.local` has the correct Supabase URL and anon key
4. **Restart Development Server**: Run `npm run dev` again after making changes

### If demo users aren't created:

1. **Check Supabase Service Role**: Make sure your Supabase project has the service role key configured
2. **Check Console Logs**: Look for any error messages in the browser console
3. **Verify API Routes**: Ensure the API routes are accessible

## Database Schema Overview

The schema includes:

- **user_profiles**: User authentication and role management
- **colonies**: Residential complexes
- **buildings**: Buildings within colonies
- **flats**: Individual units
- **bills**: Billing system
- **maintenance_requests**: Maintenance tracking
- **announcements**: Communication system

All tables have Row Level Security (RLS) enabled for proper data access control.

## Next Steps

After successful login:

1. **Explore the Dashboard**: Each role has a different dashboard view
2. **Test Features**: Try creating maintenance requests, viewing bills, etc.
3. **Customize**: Modify the demo data or create your own users
4. **Deploy**: Set up for production use

## Support

If you continue to have issues:

1. Check the browser console for error messages
2. Verify your Supabase project is active
3. Ensure all environment variables are correctly set
4. Check that the database schema was applied successfully 