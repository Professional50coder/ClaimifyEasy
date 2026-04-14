# Supabase Integration Implementation Checklist

## ✅ Completed Tasks

### Core Infrastructure
- [x] Supabase integration enabled
- [x] Environment variables configured
- [x] Supabase client (`lib/supabase/client.ts`) - imported from reference
- [x] Supabase server (`lib/supabase/server.ts`) - imported from reference
- [x] Middleware setup (`middleware.ts`) - imported from reference
- [x] Auth callback route (`app/auth/callback/route.ts`) - imported from reference

### Database Schema
- [x] Profiles table migration (`scripts/001_create_profiles.sql`)
  - User profile metadata
  - RLS policies for user privacy
- [x] Profile trigger (`scripts/002_profile_trigger.sql`)
  - Auto-creates profile on signup
  - Handles user metadata
- [x] Claims table (`scripts/003_create_claims.sql`)
  - Full claim management schema
  - RLS policies for role-based access
- [x] Documents table (`scripts/004_create_documents.sql`)
  - File storage metadata
  - RLS policies for document access
- [x] Audit logs table (`scripts/005_create_audit_logs.sql`)
  - Action tracking for compliance
  - Query filters

### Authentication
- [x] Login page (`app/auth/login/page.tsx`)
  - Email/password form
  - Error handling
  - Redirect on success
- [x] Sign-up page (`app/auth/sign-up/page.tsx`)
  - Registration form with role selection
  - Email confirmation flow
  - Success messaging
- [x] Auth error page (`app/auth/error/page.tsx`)
  - Error handling for auth failures
- [x] Protected page example (`app/protected/page.tsx`)
  - Shows how to access authenticated user data

### Services & Utilities
- [x] Auth service (`lib/supabase/auth.ts`)
  - Sign up with metadata
  - Sign in with email/password
  - Password reset
  - Profile management
- [x] Database service (`lib/supabase/database.ts`)
  - Claims CRUD operations
  - Document management
  - Audit logging
  - RLS-aware queries
- [x] Custom hooks (`hooks/use-supabase-auth.ts`)
  - `useSupabaseAuth()` - Current user and profile
  - `useSupabaseTable()` - Generic table queries
  - Real-time auth state listening

### Types & Documentation
- [x] Updated types (`lib/types.ts`)
  - Supabase-compatible User/UserProfile
  - Claim type with snake_case fields
  - ClaimDocument type
  - AuditLog type with correct field names
- [x] Environment template (`.env.local.example`)
- [x] Setup guide (`SUPABASE_SETUP.md`)
- [x] Implementation checklist (this file)

### Configuration
- [x] Package.json updated with `@supabase/supabase-js`

---

## 📋 Next Steps - To Complete Implementation

### 1. Execute Database Migrations (CRITICAL)

**Execute in Supabase SQL Editor:**

1. Go to your Supabase project
2. Click "SQL Editor" in sidebar
3. Create a new query
4. Copy-paste content from `/scripts/001_create_profiles.sql`
5. Click "Run" and verify success
6. Repeat for scripts 002-005

**Verify in Table Editor:**
- Should see: `profiles`, `claims`, `documents`, `audit_logs` tables
- Each table should have RLS enabled (lock icon visible)

### 2. Update Claims Management Pages

Replace old in-memory database calls with new Supabase functions:

**File: `app/claims/page.tsx`**
```typescript
import { getUserClaims } from '@/lib/supabase/database'
import { getUser } from '@/lib/supabase/auth'

// Instead of old db.claims, use:
const { user } = await getUser()
const { claims } = await getUserClaims(user.id)
```

**File: `app/claims/new/page.tsx`**
```typescript
import { createClaim } from '@/lib/supabase/database'

const { claim, error } = await createClaim(userId, {
  diagnosis: formData.diagnosis,
  amount: formData.amount,
  claim_type: 'medical',
})
```

**File: `app/claims/[id]/page.tsx`**
```typescript
import { getClaim, updateClaimStatus } from '@/lib/supabase/database'

const { claim } = await getClaim(claimId, userId)
```

### 3. Update Document Management

Replace file upload with Supabase approach:

**File: `app/api/documents/upload/route.ts`**
```typescript
import { uploadDocument } from '@/lib/supabase/database'

// Save file to Supabase Storage, then:
const { document, error } = await uploadDocument(userId, claimId, {
  filename: file.name,
  content_type: file.type,
  size: file.size,
  file_path: `claims/${claimId}/${file.name}`,
})
```

**File: `components/document-upload.tsx`**
```typescript
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'

const { user } = useSupabaseAuth()

// Use user.id for database operations
```

### 4. Update Dashboard Components

Replace old session/auth checks with Supabase:

**File: `components/top-nav.tsx`**
```typescript
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'
import { createClient } from '@/lib/supabase/client'

const { user, profile } = useSupabaseAuth()

// Logout function:
const handleLogout = async () => {
  const supabase = createClient()
  await supabase.auth.signOut()
}
```

### 5. Update Analytics Page

Query real claims data from Supabase:

**File: `app/analytics/page.tsx`**
```typescript
import { getAllClaims } from '@/lib/supabase/database'
import { getUser } from '@/lib/supabase/auth'

const { user, profile } = await getUser()
const { claims } = await getAllClaims(user.id, profile.role)

// Use claims for charts instead of sample data
```

### 6. Remove Old In-Memory Database Code

**Delete these files (now obsolete):**
- `lib/db.ts` (entire in-memory database)
- `lib/auth.ts` (old authentication)

**Search & replace in remaining files:**
- Replace `import { ... } from '@/lib/db'` with Supabase imports
- Replace `globalThis.__MEM_DB__` references
- Replace hardcoded test credentials

### 7. Set Up Storage for Documents (Optional)

If using file uploads:

1. Create bucket in Supabase Storage:
   - Name: `claim-documents`
   - Privacy: Public with RLS
2. Create RLS policy for file access
3. Update upload route to use `supabase.storage.from('claim-documents').upload()`

### 8. Test Authentication Flow

1. Start app: `npm run dev`
2. Go to `http://localhost:3000/auth/sign-up`
3. Sign up with test account
4. Check email for confirmation link
5. Click link → should redirect to dashboard
6. Verify profile data loaded correctly
7. Test sign out

### 9. Test Database Operations

1. Create a new claim via form
2. Check `claims` table in Supabase (should see new record)
3. Check `audit_logs` table (should see logged action)
4. Verify RLS: sign in as different user, should NOT see other user's claims
5. Test each role (patient, hospital, insurer)

### 10. Test Audit Logging

1. Perform various actions (create claim, update status)
2. Check `audit_logs` table in Supabase SQL Editor
3. Verify action type, user_id, and details are correct

### 11. Update API Routes

For any remaining API routes that use old db:

**Before:**
```typescript
import { db } from '@/lib/db'
const claim = db.claims.find(c => c.id === id)
```

**After:**
```typescript
import { getClaim } from '@/lib/supabase/database'
const { claim } = await getClaim(claimId, userId)
```

### 12. Remove Test Data & Credentials

- Delete hardcoded user accounts from old system
- Remove test passwords
- Clean up old database queries

---

## 🔍 Verification Checklist

### Database
- [ ] All 5 migration scripts executed successfully
- [ ] Tables exist in Supabase: profiles, claims, documents, audit_logs
- [ ] RLS is enabled on all tables
- [ ] Policies are visible in Supabase dashboard
- [ ] Trigger `handle_new_user` exists in Functions

### Authentication
- [ ] Sign-up page works
- [ ] Confirmation email received (check spam)
- [ ] Email confirmation link redirects to dashboard
- [ ] User appears in `auth.users` and `profiles` table
- [ ] Login works with confirmed account
- [ ] Logout works and clears session
- [ ] Protected pages redirect to login when not authenticated

### Data
- [ ] Claims can be created
- [ ] Claims appear in correct table
- [ ] User can only see their own claims (RLS)
- [ ] Audit actions logged automatically
- [ ] Role-based access working (test each role)

### Errors
- [ ] Invalid credentials show proper error message
- [ ] Network errors handled gracefully
- [ ] RLS permission errors logged (not exposed to user)
- [ ] Database connection errors handled

---

## 🐛 Common Issues & Fixes

### "User not authenticated" on protected pages
**Fix:** Ensure middleware.ts is processing auth correctly. Check that cookies are being set.

### "Profiles RLS policy" errors on signup
**Fix:** Run `002_profile_trigger.sql` - it uses `security definer` to bypass RLS for trigger.

### "Email not received"
**Fix:** Check Supabase email configuration or use magic links instead of passwords.

### "Multiple users see same data"
**Fix:** Verify RLS policies check `auth.uid() = id` correctly.

### Changes not showing in realtime
**Fix:** Add `.on()` listeners to queries or refresh manually with React key/state.

---

## 📊 Database Operations Summary

| Operation | Function | File |
|-----------|----------|------|
| Get current user | `getUser()` | `lib/supabase/auth.ts` |
| Get user profile | `getUserProfile()` | `lib/supabase/auth.ts` |
| Create claim | `createClaim()` | `lib/supabase/database.ts` |
| Get claim | `getClaim()` | `lib/supabase/database.ts` |
| Get user's claims | `getUserClaims()` | `lib/supabase/database.ts` |
| Update claim | `updateClaim()` | `lib/supabase/database.ts` |
| Update claim status | `updateClaimStatus()` | `lib/supabase/database.ts` |
| Upload document | `uploadDocument()` | `lib/supabase/database.ts` |
| Get documents | `getClaimDocuments()` | `lib/supabase/database.ts` |
| Log audit action | `logAuditAction()` | `lib/supabase/database.ts` |

---

## 🎯 Priority Order

1. **Execute migrations** (Database won't work without this)
2. **Test auth flow** (Sign up/login must work first)
3. **Update claims pages** (Core feature)
4. **Update document management** (Critical for claims)
5. **Update dashboard** (User experience)
6. **Update analytics** (Real data visualization)
7. **Remove old code** (Cleanup)
8. **Test all roles** (Authorization)
9. **Set up storage** (If using file uploads)
10. **Complete audit logging** (Compliance)

---

## 📚 Reference Files Location

If you need to re-copy any files:
- Client: `user_read_only_context/skills/supabase-next15/references/examples/lib/supabase/client.ts`
- Server: `user_read_only_context/skills/supabase-next15/references/examples/lib/supabase/server.ts`
- Middleware: `user_read_only_context/skills/supabase-next15/references/examples/middleware.ts`
- Callback: `user_read_only_context/skills/supabase-next15/references/examples/app/auth/callback/route.ts`

---

## ✨ When Complete

Once all steps above are done:
1. Remove this checklist file (SUPABASE_IMPLEMENTATION.md)
2. Update README.md with Supabase info
3. Deploy to production
4. Monitor Supabase logs for errors
5. Set up Supabase backups

**Congratulations! Your app now runs on Supabase!** 🚀
