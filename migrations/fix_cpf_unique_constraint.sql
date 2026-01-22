-- Fix CPF unique constraint to allow multiple NULL values
-- In PostgreSQL, UNIQUE constraints by default violate when multiple NULLs exist
-- This creates a unique index that treats NULLs as distinct, allowing multiple NULL CPFs

-- Drop the existing unique constraint on CPF
ALTER TABLE person DROP CONSTRAINT IF EXISTS person_cpf_key;

-- Create a new unique index that allows multiple NULLs
-- This index treats each NULL as unique (not equal to other NULLs)
CREATE UNIQUE INDEX person_cpf_key 
ON person(cpf) 
WHERE cpf IS NOT NULL;

-- Alternative: If you want to completely remove the unique constraint
-- ALTER TABLE person DROP CONSTRAINT IF EXISTS person_cpf_key;
