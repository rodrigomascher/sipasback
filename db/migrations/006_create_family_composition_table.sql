-- Migration 006: Create family_composition table
-- Creates the family composition (composição familiar) lookup table
-- with audit fields for tracking changes
-- Run this SQL in Supabase SQL Editor

-- Drop existing table if it exists (for development/testing)
-- DROP TABLE IF EXISTS family_composition CASCADE;

-- Create relationship degree lookup table (grau_parentesco)
CREATE TABLE IF NOT EXISTS public.relationship_degree (
  id SERIAL PRIMARY KEY,
  description VARCHAR(100) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_by VARCHAR(100),
  updated_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_relationship_degree_description ON relationship_degree(description);
CREATE INDEX idx_relationship_degree_active ON relationship_degree(active);

-- Create family_composition table with composite primary key
CREATE TABLE IF NOT EXISTS public.family_composition (
  id SERIAL PRIMARY KEY,
  id_family_composition INTEGER NOT NULL,
  id_person INTEGER NOT NULL,
  id_relationship_degree INTEGER REFERENCES relationship_degree(id),
  responsible INTEGER DEFAULT 0,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Audit fields
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(100),
  updated_at TIMESTAMP,
  
  -- Unique constraint for composite business key
  UNIQUE (id_family_composition, id_person),
  
  -- Foreign key to person table (if exists)
  CONSTRAINT fk_person FOREIGN KEY (id_person) REFERENCES person(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_family_composition_family ON family_composition(id_family_composition);
CREATE INDEX idx_family_composition_person ON family_composition(id_person);
CREATE INDEX idx_family_composition_relationship ON family_composition(id_relationship_degree);
CREATE INDEX idx_family_composition_responsible ON family_composition(responsible);
CREATE INDEX idx_family_composition_created_at ON family_composition(created_at);

-- Insert common relationship degrees (grau de parentesco)
INSERT INTO relationship_degree (description, active, created_by, created_at)
VALUES 
  ('Pai/Mãe', true, 'system', CURRENT_TIMESTAMP),
  ('Cônjuge/Companheiro(a)', true, 'system', CURRENT_TIMESTAMP),
  ('Filho(a)', true, 'system', CURRENT_TIMESTAMP),
  ('Enteado(a)', true, 'system', CURRENT_TIMESTAMP),
  ('Neto(a)', true, 'system', CURRENT_TIMESTAMP),
  ('Avó/Avô', true, 'system', CURRENT_TIMESTAMP),
  ('Irmão(ã)', true, 'system', CURRENT_TIMESTAMP),
  ('Tio(a)', true, 'system', CURRENT_TIMESTAMP),
  ('Primo(a)', true, 'system', CURRENT_TIMESTAMP),
  ('Padrasto/Madrasta', true, 'system', CURRENT_TIMESTAMP),
  ('Sogro(a)', true, 'system', CURRENT_TIMESTAMP),
  ('Genro/Nora', true, 'system', CURRENT_TIMESTAMP),
  ('Cunhado(a)', true, 'system', CURRENT_TIMESTAMP),
  ('Outro', true, 'system', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;


-- Migration complete
