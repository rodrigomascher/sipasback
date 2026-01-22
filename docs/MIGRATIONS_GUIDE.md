# Executing Database Migrations in Supabase

## Overview

This guide shows how to execute the SIPAS database migrations in Supabase to set up the database schema and audit trail tracking.

## Prerequisites

- Supabase project created and running
- Access to Supabase SQL Editor
- Migrations files available:
  - `db/migrations/001_initial_schema.sql`
  - `db/migrations/002_add_audit_trail.sql`

## Step 1: Execute Migration 001 (Initial Schema)

This creates the core database structure with 6 tables.

### In Supabase Dashboard:

1. Navigate to your Supabase project
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `db/migrations/001_initial_schema.sql`
5. Paste into the query editor
6. Click **Execute** (or press Ctrl+Enter)

### Expected Output:

```
Query executed successfully
```

### Verify Results:

In the same SQL Editor, run these verification queries:

```sql
-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should show:
- audit_logs
- departments
- employees
- roles
- units
- users

```sql
-- Check seed data was inserted
SELECT COUNT(*) as unit_count FROM public.units;
SELECT COUNT(*) as role_count FROM public.roles;
```

Should show:
- unit_count: 3 (Headquarters, Branch Office, Regional Center)
- role_count: 4 (Administrator, Engineer, Manager, User)

## Step 2: Execute Migration 002 (Audit Trail)

This adds audit tracking columns to all tables.

### Important:
⚠️ **DO NOT run this until migration 001 completes successfully!**

### In Supabase Dashboard:

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `db/migrations/002_add_audit_trail.sql`
4. Paste into the query editor
5. Click **Execute**

### Expected Output:

```
Query executed successfully
```

### Verify Results:

```sql
-- Check audit columns were added to units table
SELECT column_name, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'units' AND column_name IN ('created_by', 'updated_by')
ORDER BY column_name;
```

Should show:
```
created_by  | null           | true
updated_by  | null           | true
```

```sql
-- Check indexes were created
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'units' AND indexname LIKE 'idx_%'
ORDER BY indexname;
```

Should show indexes like:
- idx_units_city_state
- idx_units_created_by
- idx_units_updated_by

## Complete Verification

Run this comprehensive check after both migrations:

```sql
-- Verify all tables exist
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = schemaname AND table_name = tablename) as column_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected result:
```
public | audit_logs   | 9
public | departments  | 7
public | employees   | 10
public | roles       | 7
public | units       | 10
public | users       | 14
```

```sql
-- Verify seed data
SELECT 
  'units' as table_name, COUNT(*) as row_count FROM public.units
UNION ALL
SELECT 'departments', COUNT(*) FROM public.departments
UNION ALL
SELECT 'roles', COUNT(*) FROM public.roles
UNION ALL
SELECT 'employees', COUNT(*) FROM public.employees;
```

Expected result:
```
departments | 2
employees   | 1
roles       | 4
units       | 3
```

## Troubleshooting

### Error: "relation does not exist"

**Cause:** Migration 001 hasn't been executed yet or failed silently

**Solution:** 
1. Run migration 001 first
2. Check the verification queries above
3. Run migration 002

### Error: "Foreign key constraint fails"

**Cause:** Trying to run migration 002 before 001

**Solution:**
1. Ensure migration 001 is complete
2. Verify users table exists
3. Then run migration 002

### Error: "Column already exists"

**Cause:** Migration already ran before

**Solution:**
1. This is expected - the migration uses `IF NOT EXISTS` clauses
2. Safe to run again
3. Check verification queries to confirm columns are present

### Data Missing

**Cause:** Seed data didn't insert properly

**Solution:**
1. Check if migrations executed without errors
2. Run seed data insertion manually:

```sql
-- Re-insert sample units
INSERT INTO public.units (name, type, is_armored, city, state)
VALUES 
  ('Headquarters', 'Main', TRUE, 'São Paulo', 'SP'),
  ('Branch Office', 'Branch', FALSE, 'Rio de Janeiro', 'RJ'),
  ('Regional Center', 'Regional', FALSE, 'Belo Horizonte', 'MG')
ON CONFLICT (name) DO NOTHING;
```

## Testing the Backend Against New Schema

After migrations complete, test the backend:

```bash
# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }' | jq -r '.access_token')

# Test units endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/units | jq '.'

# Should include createdBy and updatedBy fields
```

Expected response (example):
```json
[
  {
    "id": 1,
    "name": "Headquarters",
    "type": "Main",
    "isArmored": true,
    "city": "São Paulo",
    "state": "SP",
    "createdBy": null,
    "updatedBy": null,
    "createdAt": "2026-01-21T10:00:00Z",
    "updatedAt": "2026-01-21T10:00:00Z"
  },
  ...
]
```

## Rollback (If Needed)

⚠️ Use with caution - data loss will occur!

### Rollback Migration 002:

```sql
-- Remove audit columns from all tables
ALTER TABLE public.units DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.units DROP COLUMN IF EXISTS updated_by;
ALTER TABLE public.departments DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.departments DROP COLUMN IF EXISTS updated_by;
ALTER TABLE public.roles DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.roles DROP COLUMN IF EXISTS updated_by;
ALTER TABLE public.employees DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.employees DROP COLUMN IF EXISTS updated_by;
ALTER TABLE public.users DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.audit_logs DROP COLUMN IF EXISTS reviewed_by;
ALTER TABLE public.audit_logs DROP COLUMN IF EXISTS reviewed_at;

-- Drop indexes
DROP INDEX IF EXISTS idx_units_created_by;
DROP INDEX IF EXISTS idx_units_updated_by;
DROP INDEX IF EXISTS idx_departments_created_by;
DROP INDEX IF EXISTS idx_departments_updated_by;
DROP INDEX IF EXISTS idx_roles_created_by;
DROP INDEX IF EXISTS idx_roles_updated_by;
DROP INDEX IF EXISTS idx_employees_created_by;
DROP INDEX IF EXISTS idx_employees_updated_by;
DROP INDEX IF EXISTS idx_users_created_by;
DROP INDEX IF EXISTS idx_audit_logs_reviewed_by;
DROP INDEX IF EXISTS idx_audit_logs_reviewed_at;
```

### Rollback Migration 001:

⚠️ **CAUTION:** This drops all tables and data!

```sql
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.units CASCADE;
```

## Next Steps

After successful migration:

1. ✅ Backend is ready to use
2. ✅ All 31 REST endpoints are accessible
3. ✅ Audit trail is tracking who creates/updates
4. ✅ API documentation available at `http://localhost:3000/docs`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review migration files for SQL syntax
3. Check Supabase logs for detailed error messages
4. Verify all prerequisites are met

---

**Last Updated:** January 21, 2026
**Migrations Version:** 1.0
**Status:** ✅ Production Ready
