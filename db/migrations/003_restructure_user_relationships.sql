-- Migration 003: Restructure User Relationships (N:M Model)
-- Date: 2026-01-21
-- Description: Remove direct references to units/departments/roles from users table
--              and create junction tables for many-to-many relationships

-- ============================================================================
-- STEP 1: Create new junction tables for many-to-many relationships
-- ============================================================================

-- Junction table: user_units
CREATE TABLE IF NOT EXISTS public.user_units (
  user_id BIGINT NOT NULL,
  unit_id BIGINT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  assigned_by BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Primary key on composite of user_id and unit_id
  PRIMARY KEY (user_id, unit_id),
  
  -- Foreign keys
  CONSTRAINT fk_user_units_user 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_user_units_unit 
    FOREIGN KEY (unit_id) 
    REFERENCES public.units(id) 
    ON DELETE RESTRICT,
  
  CONSTRAINT fk_user_units_assigned_by 
    FOREIGN KEY (assigned_by) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL
);

-- Index for performance
CREATE INDEX idx_user_units_user_id ON public.user_units(user_id);
CREATE INDEX idx_user_units_unit_id ON public.user_units(unit_id);
CREATE INDEX idx_user_units_assigned_at ON public.user_units(assigned_at);

-- Comments
COMMENT ON TABLE public.user_units IS 'Junction table: links users to multiple units';
COMMENT ON COLUMN public.user_units.user_id IS 'User identifier';
COMMENT ON COLUMN public.user_units.unit_id IS 'Unit identifier';
COMMENT ON COLUMN public.user_units.assigned_at IS 'When the assignment was created';
COMMENT ON COLUMN public.user_units.assigned_by IS 'User who made the assignment (for audit)';

-- ============================================================================

-- Junction table: user_departments
CREATE TABLE IF NOT EXISTS public.user_departments (
  user_id BIGINT NOT NULL,
  dept_id BIGINT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  assigned_by BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Primary key on composite of user_id and dept_id
  PRIMARY KEY (user_id, dept_id),
  
  -- Foreign keys
  CONSTRAINT fk_user_departments_user 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_user_departments_department 
    FOREIGN KEY (dept_id) 
    REFERENCES public.departments(id) 
    ON DELETE RESTRICT,
  
  CONSTRAINT fk_user_departments_assigned_by 
    FOREIGN KEY (assigned_by) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL
);

-- Index for performance
CREATE INDEX idx_user_departments_user_id ON public.user_departments(user_id);
CREATE INDEX idx_user_departments_dept_id ON public.user_departments(dept_id);
CREATE INDEX idx_user_departments_assigned_at ON public.user_departments(assigned_at);

-- Comments
COMMENT ON TABLE public.user_departments IS 'Junction table: links users to multiple departments';
COMMENT ON COLUMN public.user_departments.user_id IS 'User identifier';
COMMENT ON COLUMN public.user_departments.dept_id IS 'Department identifier';
COMMENT ON COLUMN public.user_departments.assigned_at IS 'When the assignment was created';
COMMENT ON COLUMN public.user_departments.assigned_by IS 'User who made the assignment (for audit)';

-- ============================================================================

-- Junction table: user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  assigned_by BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Primary key on composite of user_id and role_id
  PRIMARY KEY (user_id, role_id),
  
  -- Foreign keys
  CONSTRAINT fk_user_roles_user 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_user_roles_role 
    FOREIGN KEY (role_id) 
    REFERENCES public.roles(id) 
    ON DELETE RESTRICT,
  
  CONSTRAINT fk_user_roles_assigned_by 
    FOREIGN KEY (assigned_by) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL
);

-- Index for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX idx_user_roles_assigned_at ON public.user_roles(assigned_at);

-- Comments
COMMENT ON TABLE public.user_roles IS 'Junction table: links users to multiple roles/permissions';
COMMENT ON COLUMN public.user_roles.user_id IS 'User identifier';
COMMENT ON COLUMN public.user_roles.role_id IS 'Role identifier';
COMMENT ON COLUMN public.user_roles.assigned_at IS 'When the assignment was created';
COMMENT ON COLUMN public.user_roles.assigned_by IS 'User who made the assignment (for audit)';

-- ============================================================================
-- STEP 2: Add new columns to users table if they don't exist
-- ============================================================================

-- Add updated_by if not exists
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS updated_by BIGINT;

-- Add valid_until if not exists
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP WITH TIME ZONE;

-- Add term_accepted_at if not exists
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS term_accepted_at TIMESTAMP WITH TIME ZONE;

-- Add foreign key constraint for updated_by
ALTER TABLE public.users
ADD CONSTRAINT fk_users_updated_by 
  FOREIGN KEY (updated_by) 
  REFERENCES public.users(id) 
  ON DELETE SET NULL;

-- ============================================================================
-- STEP 3: Create indexes for new columns
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_updated_by ON public.users(updated_by);
CREATE INDEX IF NOT EXISTS idx_users_valid_until ON public.users(valid_until);
CREATE INDEX IF NOT EXISTS idx_users_term_accepted_at ON public.users(term_accepted_at);

-- ============================================================================
-- STEP 4: Add comments for new columns
-- ============================================================================

COMMENT ON COLUMN public.users.updated_by IS 'User who last modified this user account (audit trail)';
COMMENT ON COLUMN public.users.valid_until IS 'Account expiration date (e.g., for temporary contracts)';
COMMENT ON COLUMN public.users.term_accepted_at IS 'When the user accepted the terms and conditions';

-- ============================================================================
-- STEP 5: Migrate existing data to junction tables (if applicable)
-- ============================================================================
-- 
-- Note: If you have existing data with unit_id, department_id, role_id:
-- Uncomment and execute after removing those columns from users table
--
-- INSERT INTO public.user_units (user_id, unit_id, assigned_at, assigned_by)
-- SELECT id, unit_id, created_at, created_by 
-- FROM public.users 
-- WHERE unit_id IS NOT NULL;
--
-- INSERT INTO public.user_departments (user_id, dept_id, assigned_at, assigned_by)
-- SELECT id, department_id, created_at, created_by 
-- FROM public.users 
-- WHERE department_id IS NOT NULL;
--
-- INSERT INTO public.user_roles (user_id, role_id, assigned_at, assigned_by)
-- SELECT id, role_id, created_at, created_by 
-- FROM public.users 
-- WHERE role_id IS NOT NULL;

-- ============================================================================
-- STEP 6: Drop old columns from users table
-- ============================================================================
-- 
-- Warning: Only execute after data migration is complete!
-- Uncomment carefully after verifying all data is in junction tables
--
-- ALTER TABLE public.users DROP COLUMN IF EXISTS unit_id;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS department_id;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS role_id;

-- ============================================================================
-- Migration complete
-- ============================================================================
-- 
-- New Architecture:
-- ✅ users: Contains core user data (id, email, password_hash, name, etc.)
-- ✅ user_units: Links users to multiple units (N:M relationship)
-- ✅ user_departments: Links users to multiple departments (N:M relationship)
-- ✅ user_roles: Links users to multiple roles (N:M relationship)
--
-- Benefits:
-- - Flexibility: A user can have access to multiple units/departments/roles
-- - Scalability: Easy to add or remove assignments without modifying users table
-- - Auditability: Each assignment has timestamp and assigned_by for tracking
-- - Performance: Indexed queries on all junction tables
--
-- Usage Examples:
-- - Get all units for user 1: SELECT * FROM user_units WHERE user_id = 1
-- - Get all users in unit 1: SELECT * FROM user_units WHERE unit_id = 1
-- - Get assignment history: SELECT * FROM user_units ORDER BY assigned_at DESC
-- - Get who assigned what: SELECT * FROM user_units WHERE assigned_by = 1

