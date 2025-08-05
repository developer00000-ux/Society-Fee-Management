# Demo Users Setup Guide

This guide explains how to properly set up demo users for the society management system without encountering foreign key constraint errors.

## The Problem

The error you encountered:
```
ERROR: 23503: insert or update on table "user_profiles" violates foreign key constraint "user_profiles_id_fkey"
DETAIL: Key (id)=(550e8400-e29b-41d4-a716-446655440020) is not present in table "users".
```

This happens because the `user_profiles` table has a foreign key constraint that references `auth.users(id)`. You cannot create user profiles without first creating the corresponding users in Supabase Auth.

## Solution Options

### Option 1: Manual Setup via Supabase Dashboard (Recommended for testing)

1. **Go to your Supabase Dashboard**
   - Navigate to Authentication > Users

2. **Create users manually**
   - Click "Add User" for each demo user
   - Use these details:

   | Email | Password | User ID |
   |-------|----------|---------|
   | superadmin@example.com | password123 | 550e8400-e29b-41d4-a716-446655440020 |
   | colonyadmin@example.com | password123 | 550e8400-e29b-41d4-a716-446655440021 |
   | blockmanager@example.com | password123 | 550e8400-e29b-41d4-a716-446655440022 |
   | resident1@example.com | password123 | 550e8400-e29b-41d4-a716-446655440023 |
   | resident2@example.com | password123 | 550e8400-e29b-41d4-a716-446655440024 |
   | resident3@example.com | password123 | 550e8400-e29b-41d4-a716-446655440025 |

3. **Run the demo-users.sql script**
   - After creating all users, run the `demo-users.sql` script

### Option 2: Automated Setup using Node.js Script

1. **Install dependencies**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Set environment variables**
   ```bash
   export SUPABASE_URL="your-supabase-url"
   export NEXT_PUBLIC_NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

3. **Run the script**
   ```bash
   node create-demo-users.js
   ```

4. **Run the demo-users.sql script**
   ```bash
   # After the users are created, run the SQL script
   ```

### Option 3: Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Create users via API calls**
   ```bash
   # You can use curl or any HTTP client to create users
   curl -X POST "https://your-project.supabase.co/auth/v1/admin/users" \
     -H "apikey: YOUR_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "superadmin@example.com",
       "password": "password123",
       "user_metadata": {"first_name": "Super", "last_name": "Admin"}
     }'
   ```

## Demo User Roles

The demo users have the following roles:

- **Super Admin** (`superadmin@example.com`): Full system access
- **Colony Admin** (`colonyadmin@example.com`): Manages a specific colony
- **Block Manager** (`blockmanager@example.com`): Manages a specific building/block
- **Residents** (`resident1@example.com`, `resident2@example.com`, `resident3@example.com`): Regular residents

## Login Credentials

All demo users have the password: `password123`

## Troubleshooting

### If you still get foreign key errors:

1. **Check if users exist in Auth**
   ```sql
   SELECT * FROM auth.users WHERE id IN (
     '550e8400-e29b-41d4-a716-446655440020',
     '550e8400-e29b-41d4-a716-446655440021',
     '550e8400-e29b-41d4-a716-446655440022',
     '550e8400-e29b-41d4-a716-446655440023',
     '550e8400-e29b-41d4-a716-446655440024',
     '550e8400-e29b-41d4-a716-446655440025'
   );
   ```

2. **Verify user profiles don't already exist**
   ```sql
   SELECT * FROM user_profiles WHERE id IN (
     '550e8400-e29b-41d4-a716-446655440020',
     '550e8400-e29b-41d4-a716-446655440021',
     '550e8400-e29b-41d4-a716-446655440022',
     '550e8400-e29b-41d4-a716-446655440023',
     '550e8400-e29b-41d4-a716-446655440024',
     '550e8400-e29b-41d4-a716-446655440025'
   );
   ```

3. **Clear existing data if needed**
   ```sql
   DELETE FROM user_profiles WHERE id IN (
     '550e8400-e29b-41d4-a716-446655440020',
     '550e8400-e29b-41d4-a716-446655440021',
     '550e8400-e29b-41d4-a716-446655440022',
     '550e8400-e29b-41d4-a716-446655440023',
     '550e8400-e29b-41d4-a716-446655440024',
     '550e8400-e29b-41d4-a716-446655440025'
   );
   ```

## Next Steps

After successfully creating the demo users and running the SQL script, you should be able to:

1. Login with any of the demo accounts
2. See the appropriate dashboard based on user role
3. Test all the features of the society management system

## Security Note

These are demo users with simple passwords. In a production environment:

- Use strong, unique passwords
- Enable email verification
- Implement proper password policies
- Consider using OAuth providers
- Regularly rotate passwords 