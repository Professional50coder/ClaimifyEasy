# Database Setup Guide - Supabase

## Quick Reference

**Status:** Supabase integration complete. Database schema ready to deploy.

**Time to Complete:** 5-10 minutes

---

## Step 1: Access Supabase SQL Editor

1. Log into your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

---

## Step 2: Execute Migrations (in order)

### Migration 001: Create Profiles Table

Copy and paste the entire content of `scripts/001_create_profiles.sql` into the SQL Editor, then click **Run**.

**What it does:**
- Creates `profiles` table linked to auth.users
- Enables Row-Level Security (RLS)
- Creates policies so users can only see their own profile

**Expected result:** ✅ Query executed successfully

---

### Migration 002: Create Profile Trigger

Copy and paste the entire content of `scripts/002_profile_trigger.sql` into the SQL Editor, then click **Run**.

**What it does:**
- Creates function `handle_new_user()`
- Creates trigger that runs when user signs up
- Automatically creates profile record with user metadata

**Expected result:** ✅ Query executed successfully

---

### Migration 003: Create Claims Table

Copy and paste the entire content of `scripts/003_create_claims.sql` into the SQL Editor, then click **Run**.

**What it does:**
- Creates `claims` table for insurance claims
- Links to profiles table
- Enables RLS with role-based policies:
  - Patients see only their claims
  - Hospitals see their patients' claims
  - Insurers see all claims
  - Admins see all claims

**Expected result:** ✅ Query executed successfully

---

### Migration 004: Create Documents Table

Copy and paste the entire content of `scripts/004_create_documents.sql` into the SQL Editor, then click **Run**.

**What it does:**
- Creates `documents` table for claim files
- Links to claims table
- Tracks file metadata (name, type, size, path)
- Enables RLS for document access

**Expected result:** ✅ Query executed successfully

---

### Migration 005: Create Audit Logs Table

Copy and paste the entire content of `scripts/005_create_audit_logs.sql` into the SQL Editor, then click **Run**.

**What it does:**
- Creates `audit_logs` table for tracking actions
- Logs user_id, action type, and change details
- Required for compliance and debugging

**Expected result:** ✅ Query executed successfully

---

## Step 3: Verify Tables Created

In Supabase, click **Table Editor** in the left sidebar.

You should see these tables:
- ✅ `audit_logs`
- ✅ `claims`
- ✅ `documents`
- ✅ `profiles`

Each table should have a **lock icon** 🔒 indicating RLS is enabled.

---

## Step 4: Verify RLS Policies

Click on each table and select the **RLS Policies** tab. You should see policies like:
- `profiles_select_own` - Users can see their own profile
- `claims_select_patient` - Patients see their claims
- `claims_select_hospital` - Hospitals see relevant claims
- etc.

---

## Step 5: Verify Trigger

Click **Database** → **Functions** in left sidebar.

You should see:
- ✅ `handle_new_user()` function
- ✅ Trigger on `auth.users` table

---

## Step 6: Test the Setup

### Create a Test User via SQL

In SQL Editor, run:
```sql
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name":"Test","last_name":"User","role":"patient"}'
);
```

### Verify Profile Created

In Table Editor:
1. Click **profiles** table
2. You should see a row with:
   - `id` - UUID (auto-generated)
   - `name` - "Test User"
   - `email` - "test@example.com"
   - `role` - "patient"

If you don't see a profile → Trigger didn't execute. Check function `handle_new_user()` in Functions.

---

## Step 7: Test RLS Policies

### Test as Patient (can see only own claims)

Run in SQL Editor:
```sql
-- Set role to patient
SET ROLE authenticated;
SET request.jwt.claim.sub = 'USER_ID_HERE';

SELECT * FROM profiles;  -- Should return 1 row (their own)
SELECT * FROM claims;    -- Should return only their claims
```

### Test as Admin (can see all claims)

Run in SQL Editor:
```sql
-- Set role to admin
SET ROLE authenticated;
SET request.jwt.claim.sub = 'ADMIN_ID_HERE';

SELECT * FROM profiles;  -- Should return all rows
SELECT * FROM claims;    -- Should return all claims
```

If RLS is working:
- Patient user gets fewer rows
- Admin user gets all rows

---

## Troubleshooting

### Issue: Migration fails with "permission denied"

**Solution:**
- You're logged in with limited permissions
- Log out and sign back in as project owner
- Try again in SQL Editor

### Issue: Trigger not creating profile

**Solution:**
1. Check that `handle_new_user()` function exists
2. Verify trigger `on_auth_user_created` exists
3. Try manually inserting into profiles:
   ```sql
   INSERT INTO profiles (id, name, email, role)
   VALUES (
     '00000000-0000-0000-0000-000000000001',
     'Test',
     'test@example.com',
     'patient'
   );
   ```

### Issue: RLS blocking queries

**Solution:**
- Check if you're authenticated (logged in)
- Verify user_id in JWT matches table owner
- Check RLS policy syntax in policies tab

### Issue: "relation already exists" error

**Solution:**
- Table was already created by previous migration
- This is normal, click Continue
- Or drop and recreate: `DROP TABLE IF EXISTS tablename CASCADE;`

### Issue: Can't see columns in table

**Solution:**
- Refresh browser (Cmd+R or Ctrl+R)
- Close and reopen Table Editor
- Check that table columns appear in SQL Editor

---

## Database Structure at a Glance

```
Supabase Project
├── Auth (built-in)
│   └── users (email, password, JWT)
│
└── Public Schema
    ├── profiles (user metadata)
    │   ├── RLS: Users can see only own profile
    │   └── Trigger: Auto-created on signup
    │
    ├── claims (insurance claims)
    │   ├── RLS: Patients see own, Hospitals/Insurers/Admins see based on role
    │   └── Audit log created on insert/update
    │
    ├── documents (claim files)
    │   ├── RLS: Users can see documents they uploaded
    │   └── Links to claims
    │
    └── audit_logs (action tracking)
        └── All actions logged for compliance
```

---

## Next Steps

1. ✅ **Database schema created**
2. ✅ **RLS policies configured**
3. ✅ **Trigger set up**
4. 🔄 **Start the app** - `npm run dev`
5. 🔄 **Test sign up** - http://localhost:3000/auth/sign-up
6. 🔄 **Test login** - http://localhost:3000/auth/login
7. 🔄 **Update pages** - Replace old db calls with Supabase functions

---

## SQL Quick Reference

### Check if table exists
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);
```

### Check RLS is enabled
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

### View RLS policies
```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'public';
```

### Drop and recreate table
```sql
DROP TABLE IF EXISTS profiles CASCADE;
-- Then re-run migration script
```

### Check trigger
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

### Check function
```sql
SELECT * FROM pg_proc 
WHERE proname = 'handle_new_user';
```

---

## Useful Links

- [Supabase SQL Editor](https://supabase.com/dashboard) (Your project)
- [PostgreSQL Docs](https://www.postgresql.org/docs/current/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Managing Tables](https://supabase.com/docs/guides/getting-started/tables)

---

## Support

**Something not working?**

1. Check Supabase dashboard for error messages
2. Review the SQL in each migration script
3. Verify table exists in Table Editor
4. Test query in SQL Editor
5. Check RLS policies

See `SUPABASE_SETUP.md` for more help.

---

**Status:** Ready to Deploy

Once migrations complete, your app is ready to:
- Handle user signup/login
- Store claims securely
- Enforce role-based access
- Track audit logs
- Scale to thousands of users

Start the app with `npm run dev` and test at http://localhost:3000/auth/sign-up
