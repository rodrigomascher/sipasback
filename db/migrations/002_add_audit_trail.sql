/**
 * SIPAS Database Migration 002
 * Add audit trail (created_by, updated_by) to all tables
 * 
 * This migration adds user tracking to all resource tables:
 * - departments
 * - roles
 * - employees
 * 
 * Note: units table already has created_by, updated_by from migration 001
 * 
 * Run this SQL in Supabase SQL Editor after migration 001
 */

-- ============================================
-- ALTER DEPARTMENTS TABLE
-- ============================================
-- Add created_by and updated_by columns if they don't exist
ALTER TABLE public.departments
ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL;

-- Create indexes for audit columns
CREATE INDEX IF NOT EXISTS idx_departments_created_by ON public.departments(created_by);
CREATE INDEX IF NOT EXISTS idx_departments_updated_by ON public.departments(updated_by);

-- ============================================
-- ALTER ROLES TABLE
-- ============================================
-- Add created_by and updated_by columns if they don't exist
ALTER TABLE public.roles
ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL;

-- Create indexes for audit columns
CREATE INDEX IF NOT EXISTS idx_roles_created_by ON public.roles(created_by);
CREATE INDEX IF NOT EXISTS idx_roles_updated_by ON public.roles(updated_by);

-- ============================================
-- ALTER EMPLOYEES TABLE
-- ============================================
-- Add created_by and updated_by columns if they don't exist
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL;

-- Create indexes for audit columns
CREATE INDEX IF NOT EXISTS idx_employees_created_by ON public.employees(created_by);
CREATE INDEX IF NOT EXISTS idx_employees_updated_by ON public.employees(updated_by);

-- ============================================
-- ALTER USERS TABLE
-- ============================================
-- Add created_by for users created by admins (system users created by admin@example.com)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL;

-- Create index for audit column
CREATE INDEX IF NOT EXISTS idx_users_created_by ON public.users(created_by);

-- ============================================
-- ALTER AUDIT_LOGS TABLE
-- ============================================
-- Add updated_by for tracking who reviewed the audit log (future enhancement)
ALTER TABLE public.audit_logs
ADD COLUMN IF NOT EXISTS reviewed_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_reviewed_by ON public.audit_logs(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_reviewed_at ON public.audit_logs(reviewed_at);

-- ============================================
-- COMMENTS (Documentation)
-- ============================================
COMMENT ON COLUMN public.units.created_by IS 'ID of user who created this record';
COMMENT ON COLUMN public.units.updated_by IS 'ID of user who last modified this record';

COMMENT ON COLUMN public.departments.created_by IS 'ID of user who created this record';
COMMENT ON COLUMN public.departments.updated_by IS 'ID of user who last modified this record';

COMMENT ON COLUMN public.roles.created_by IS 'ID of user who created this record';
COMMENT ON COLUMN public.roles.updated_by IS 'ID of user who last modified this record';

COMMENT ON COLUMN public.employees.created_by IS 'ID of user who created this record';
COMMENT ON COLUMN public.employees.updated_by IS 'ID of user who last modified this record';

COMMENT ON COLUMN public.users.created_by IS 'ID of user who created this user account';

-- ============================================
-- DATA INTEGRITY
-- ============================================
-- Set default created_by for existing records if needed (optional)
-- This only runs if there are records without created_by set
-- UPDATE public.departments SET created_by = 1 WHERE created_by IS NULL AND id > 0;
-- UPDATE public.roles SET created_by = 1 WHERE created_by IS NULL AND id > 0;
-- UPDATE public.employees SET created_by = 1 WHERE created_by IS NULL AND id > 0;
