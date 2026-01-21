/**
 * SIPAS Database Schema - Supabase Migration
 * Run this SQL in Supabase SQL Editor
 * 
 * Tables:
 * 1. units - Organizational units
 * 2. departments - Departments
 * 3. roles - User roles/functions
 * 4. users - User accounts with session data
 * 5. employees - Employee information
 */

-- ============================================
-- 1. UNITS TABLE (Unidades Organizacionais)
-- ============================================
CREATE TABLE IF NOT EXISTS public.units (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  is_armored BOOLEAN DEFAULT FALSE,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_units_city_state ON public.units(city, state);

-- ============================================
-- 2. DEPARTMENTS TABLE (Secretarias)
-- ============================================
CREATE TABLE IF NOT EXISTS public.departments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  unit_id BIGINT NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_departments_unit_id ON public.departments(unit_id);

-- ============================================
-- 3. ROLES TABLE (Funções/Cargos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_technician BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. EMPLOYEES TABLE (Funcionários)
-- ============================================
CREATE TABLE IF NOT EXISTS public.employees (
  id BIGSERIAL PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  unit_id BIGINT NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  department_id BIGINT NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  role_id BIGINT REFERENCES public.roles(id) ON DELETE SET NULL,
  is_technician BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_employees_unit_id ON public.employees(unit_id);
CREATE INDEX idx_employees_department_id ON public.employees(department_id);
CREATE INDEX idx_employees_role_id ON public.employees(role_id);

-- ============================================
-- 5. USERS TABLE (Usuários/Contas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  employee_id BIGINT REFERENCES public.employees(id) ON DELETE SET NULL,
  unit_id BIGINT NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  department_id BIGINT NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  role_id BIGINT REFERENCES public.roles(id) ON DELETE SET NULL,
  api_key VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_unit_id ON public.users(unit_id);
CREATE INDEX idx_users_department_id ON public.users(department_id);
CREATE INDEX idx_users_role_id ON public.users(role_id);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- ============================================
-- 6. AUDIT LOG TABLE (Auditoria)
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================
-- 7. SEED DATA
-- ============================================

-- Insert sample units
INSERT INTO public.units (name, type, is_armored, city, state)
VALUES 
  ('Headquarters', 'Main', TRUE, 'São Paulo', 'SP'),
  ('Branch Office', 'Branch', FALSE, 'Rio de Janeiro', 'RJ'),
  ('Regional Center', 'Regional', FALSE, 'Belo Horizonte', 'MG')
ON CONFLICT (name) DO NOTHING;

-- Insert sample departments
INSERT INTO public.departments (name, unit_id)
SELECT 'Administration', id FROM public.units WHERE name = 'Headquarters'
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.departments (name, unit_id)
SELECT 'Engineering', id FROM public.units WHERE name = 'Headquarters'
ON CONFLICT (name) DO NOTHING;

-- Insert sample roles
INSERT INTO public.roles (name, description, is_technician)
VALUES 
  ('Administrator', 'System administrator', FALSE),
  ('Engineer', 'Technical engineer', TRUE),
  ('Manager', 'Department manager', FALSE),
  ('User', 'Regular user', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Insert sample employee
INSERT INTO public.employees (employee_id, full_name, unit_id, department_id, role_id, is_technician)
SELECT 
  '12345',
  'John Smith',
  u.id,
  d.id,
  r.id,
  TRUE
FROM public.units u
JOIN public.departments d ON d.unit_id = u.id
JOIN public.roles r ON r.name = 'Engineer'
WHERE u.name = 'Headquarters' AND d.name = 'Engineering'
ON CONFLICT (employee_id) DO NOTHING;

-- Note: Admin user should be created via application with proper password hashing
-- Don't create passwords in raw SQL!

-- ============================================
-- POLICIES (Row Level Security)
-- ============================================

-- NOTE: RLS policies are commented out because this app uses JWT authentication
-- managed by NestJS, not Supabase Auth. If you integrate with Supabase Auth in the future,
-- you'll need to add auth_uuid column and update these policies accordingly.

-- To enable RLS in the future:
-- 1. Add: ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- 2. Add: ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- 3. Update policies to use auth_uuid column instead of auth.uid()
