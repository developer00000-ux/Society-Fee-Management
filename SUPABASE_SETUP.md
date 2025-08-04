# Supabase Setup Guide

## Quick Setup Steps

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be set up (usually 1-2 minutes)

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://your-project.supabase.co`)
3. Copy your **anon public** key (starts with `eyJ...`)

### 3. Update Environment Variables
1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Create the Database Table
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase/schema.sql`
3. Click "Run" to create the table

### 5. Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Database Schema

The `fee_entries` table includes:
- **id**: UUID (auto-generated)
- **block**: Block letter (A, B, C, etc.)
- **member_name**: Member's full name
- **flat_number**: Flat/apartment number
- **months**: Array of selected months
- **fee**: Monthly fee amount
- **total_fee**: Total for selected months
- **payment_type**: Payment method (UPI, Cash, etc.)
- **remarks**: Additional notes
- **created_at**: Timestamp

## Troubleshooting

### "Supabase is not configured" Error
- Check that your `.env.local` file exists and has the correct values
- Make sure you're not using the placeholder values
- Restart your development server after updating environment variables

### "Table doesn't exist" Error
- Run the SQL schema in your Supabase SQL Editor
- Check that the table was created successfully in the Table Editor

### Connection Issues
- Verify your Project URL and anon key are correct
- Check that your Supabase project is active (not paused)
- Ensure your project is in the same region as your users

## Features Available

✅ **With Supabase Configured:**
- Data persistence across sessions
- Real-time database operations
- Automatic data loading
- Error handling and validation

⚠️ **Without Supabase:**
- Form works normally
- Data stored only in browser memory
- Data lost on page refresh
- No server-side validation

## Next Steps

Once Supabase is configured:
1. Test the form by submitting a few entries
2. Check your Supabase dashboard to see the data
3. Consider adding authentication for production use
4. Set up Row Level Security policies as needed 