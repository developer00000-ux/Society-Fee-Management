# Forgot Password Functionality Guide

## Overview
The forgot password functionality allows users to reset their password securely through email verification.

## How it Works

### 1. Forgot Password Request
- User visits `/forgot-password` page
- Enters their email address
- System sends a password reset link to their email
- Uses Supabase's built-in password reset functionality

### 2. Password Reset Process
- User clicks the reset link in their email
- They are redirected to `/reset-password` page
- User enters and confirms their new password
- Password is updated securely through API

## Files Created/Modified

### New Files:
- `app/(auth)/forgot-password/page.tsx` - Forgot password form
- `app/(auth)/reset-password/page.tsx` - Password reset form
- `app/api/auth/reset-password/route.ts` - API for sending reset emails
- `app/api/auth/update-password/route.ts` - API for updating passwords

### Modified Files:
- `app/(auth)/login/page.tsx` - Added link to forgot password page

## Security Features

1. **Email Verification**: Uses Supabase's secure email verification system
2. **Token Validation**: Reset links are time-limited and secure
3. **Password Requirements**: Minimum 6 characters required
4. **Error Handling**: Proper error messages without revealing user existence
5. **API Security**: Server-side validation and authentication checks

## Environment Variables Required

Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=your_site_url (optional, defaults to localhost:3000)
```

## Usage

1. User clicks "Forgot your password?" on login page
2. User enters email and submits form
3. User receives email with reset link
4. User clicks link and sets new password
5. User is redirected to login page

## Testing

To test the functionality:
1. Create a user account
2. Go to `/forgot-password`
3. Enter the user's email
4. Check email for reset link
5. Click link and set new password
6. Try logging in with new password

## Notes

- The system uses Supabase's built-in password reset functionality
- Reset links expire after a certain time (configured in Supabase)
- Users must have a valid email address to use this feature
- The system doesn't reveal whether an email exists or not (security best practice) 