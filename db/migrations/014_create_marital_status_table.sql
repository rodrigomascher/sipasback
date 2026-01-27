CREATE TABLE marital_status (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL REFERENCES "users"(id) ON DELETE RESTRICT,
  updated_by INTEGER REFERENCES "users"(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marital_status_active ON marital_status(active);
CREATE INDEX idx_marital_status_description ON marital_status(description);

-- Add foreign key to person table
ALTER TABLE person
ADD COLUMN IF NOT EXISTS marital_status_id INTEGER;

-- Add foreign key constraint (using DO block to check if it exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_person_marital_status_id'
  ) THEN
    ALTER TABLE person
    ADD CONSTRAINT fk_person_marital_status_id 
    FOREIGN KEY (marital_status_id) REFERENCES marital_status(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_person_marital_status_id ON person(marital_status_id);
