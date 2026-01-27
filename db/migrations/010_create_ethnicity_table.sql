-- Create ethnicity table
CREATE TABLE ethnicity (
  id SERIAL PRIMARY KEY,
  description VARCHAR(100) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL,
  updated_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ethnicity_description ON ethnicity(description);
CREATE INDEX idx_ethnicity_active ON ethnicity(active);

-- Add ethnicity_id column to person table
ALTER TABLE person
ADD COLUMN IF NOT EXISTS ethnicity_id INTEGER;

-- Add foreign key constraint (using DO block to check if it exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_person_ethnicity_id'
  ) THEN
    ALTER TABLE person
    ADD CONSTRAINT fk_person_ethnicity_id 
    FOREIGN KEY (ethnicity_id) REFERENCES ethnicity(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for ethnicity_id in person table
CREATE INDEX IF NOT EXISTS idx_person_ethnicity_id ON person(ethnicity_id);
