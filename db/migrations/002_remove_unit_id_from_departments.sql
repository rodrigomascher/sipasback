/**
 * SIPAS Database Migration 002
 * Remove unit_id column from departments table
 */

-- Drop the foreign key constraint and index
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_unit_id_fkey;
DROP INDEX IF EXISTS idx_departments_unit_id;

-- Remove the unit_id column
ALTER TABLE public.departments DROP COLUMN IF EXISTS unit_id;
