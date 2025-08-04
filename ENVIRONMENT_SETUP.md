# Environment Setup Guide

## Required Environment Variables

You need to create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## How to Get These Values

### 1. Supabase Project Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be created (1-2 minutes)

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

### 3. Create .env.local File
Create a file named `.env.local` in your project root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Setup

After setting up the environment variables:

1. **Run the database schema:**
   ```bash
   # Copy the contents of supabase/schema.sql
   # Paste it in your Supabase SQL Editor and run it
   ```

2. **Setup demo users:**
   - Go to your login page
   - Click "Setup Demo Users" button
   - This will create all demo users with correct IDs

## Troubleshooting

### "supabaseKey is required" Error
- Make sure `.env.local` file exists in project root
- Verify all three environment variables are set
- Restart your development server after creating `.env.local`

### "Service role key not found" Error
- The service role key is required for admin operations (creating users)
- Make sure `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

### Environment Variables Not Loading
- Ensure the file is named exactly `.env.local` (not `.env`)
- Restart your development server
- Check that the file is in the project root directory

## Security Notes

- **Never commit `.env.local` to version control**
- The `.env.local` file is already in `.gitignore`
- `NEXT_PUBLIC_` variables are exposed to the browser
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` should be kept secret (server-side only)

## Testing

After setup, you can test the login with:
- Email: `superadmin@example.com`
- Password: `password123` 