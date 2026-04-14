# Supabase Integration Setup Guide

## Overview

This application now uses **Supabase** for:
- User authentication (email/password)
- Database storage (users, claims, documents, audit logs)
- Row-Level Security (RLS) for data protection
- Session management with automatic token refresh

## Prerequisites

1. Supabase account (https://supabase.com)
2. Node.js 18+ and npm/pnpm installed
3. Environment variables configured

## Quick Start (5 minutes)

### 1. Create a Supabase Project

- Go to https://supabase.com and sign up
- Create a new project
- Wait for the project to initialize (2-3 minutes)
- Copy your credentials from Project Settings → API

### 2. Set Environment Variables

The Supabase integration automatically provides:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Database credentials (POSTGRES_*)

These are automatically set in the v0 environment. For local development, create `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in your Supabase credentials.

### 3. Run Database Migrations

**In v0 Dashboard (Recommended):**
1. Go to the Supabase SQL Editor
2. Copy the SQL from each script in `/scripts/`:
   - `001_create_profiles.sql`
   - `002_profile_trigger.sql`
   - `003_create_claims.sql`
   - `004_create_documents.sql`
   - `005_create_audit_logs.sql`
3. Paste and execute each script

**Or Run Python Migration Script (Local):**
```bash
cd scripts
python3 run_migrations.py
```

### 4. Start the Application

```bash
npm run dev
# or
pnpm dev
```

Visit http://localhost:3000 and test:
- Sign up: http://localhost:3000/auth/sign-up
- Login: http://localhost:3000/auth/login

## Database Schema

### profiles
Stores user profile information synced with auth.users

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'patient',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### claims
Stores insurance claims with RLS for user access

```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id),
  diagnosis TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'submitted',
  ...
)
```

### documents
Stores claim-related documents

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  file_name TEXT,
  file_path TEXT,
  ...
)
```

### audit_logs
Tracks all user actions for compliance

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT,
  details JSONB,
  created_at TIMESTAMP
)
```

## Key Features

### Row-Level Security (RLS)

All tables have RLS enabled:
- **Patients** can only see their own data
- **Hospitals** can see claims from their affiliated patients
- **Insurers** can view all claims (based on RLS policy)
- **Admins** can access everything

### Auto-Create Profiles

When a user signs up, the database trigger `handle_new_user()` automatically creates a profile record with their metadata.

### Audit Logging

All important actions are logged automatically via the audit_logs table for compliance and debugging.

## Authentication Flow

1. User signs up with email/password
2. Supabase creates auth.users record
3. Trigger creates profiles record
4. Confirmation email is sent
5. User clicks confirmation link → redirects to `/auth/callback`
6. Session is created and stored in secure HTTP-only cookie
7. User can access protected pages

## Code Usage Examples

### Sign Up (Client-side)
```typescript
import { signUp } from '@/lib/supabase/auth'

const { data, error } = await signUp(
  'user@example.com',
  'password123',
  { firstName: 'John', role: 'patient' }
)
```

### Get Current User (Server-side)
```typescript
import { getUser } from '@/lib/supabase/auth'

const { user, error } = await getUser()
```

### Create a Claim (Server-side)
```typescript
import { createClaim } from '@/lib/supabase/database'

const { claim, error } = await createClaim(userId, {
  diagnosis: 'Appendicitis',
  amount: 5000,
  claim_type: 'surgery'
})
```

### Get User's Claims (Server-side)
```typescript
import { getUserClaims } from '@/lib/supabase/database'

const { claims, error } = await getUserClaims(userId)
```

## Testing Users

After setup, test with these roles:

- **Patient**: Sign up with role "Patient"
- **Hospital**: Sign up with role "Hospital"
- **Insurer**: Sign up with role "Insurance Company"

Each role has different RLS permissions for viewing/editing claims.

## Troubleshooting

### "User not found" error
- Check if email confirmation is complete
- Verify profiles table has RLS policies
- Check if trigger `handle_new_user` executed successfully

### "Permission denied" error
- This is RLS blocking access
- Verify user has correct role
- Check RLS policies in Supabase dashboard

### Database connection errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check if Supabase project is active
- Test connection in SQL editor

### "No rows returned" on signup
- Ensure trigger runs after user creation
- Check `handle_new_user()` function in Supabase
- Manually create profile if needed

## Migration from Old System

If migrating from in-memory database:

1. Export data from old system
2. Transform to Supabase schema
3. Import via SQL scripts
4. Test RLS policies
5. Update references in code from `lib/db.ts` to `lib/supabase/database.ts`

## Next Steps

1. ✅ Database schema created
2. ✅ Authentication set up
3. 📝 Build claims management pages
4. 📝 Implement document upload
5. 📝 Add role-based access controls
6. 📝 Set up email notifications

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

## Support

For issues:
1. Check Supabase dashboard logs
2. Review RLS policies
3. Check browser console for client errors
4. Review server logs for API errors
