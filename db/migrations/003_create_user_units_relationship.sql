/**
 * SIPAS Database Migration 003
 * Create user_units junction table for many-to-many relationship
 */

-- Create junction table for user-units relationship
CREATE TABLE IF NOT EXISTS public.user_units (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  unit_id BIGINT NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, unit_id)
);

-- Create indexes for fast lookups
CREATE INDEX idx_user_units_user_id ON public.user_units(user_id);
CREATE INDEX idx_user_units_unit_id ON public.user_units(unit_id);

-- If unit_id exists in users table as a single reference, you can keep it for backward compatibility
-- or remove it if you prefer pure many-to-many relationship
