CREATE TABLE income_type (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL REFERENCES "users"(id) ON DELETE RESTRICT,
  updated_by INTEGER REFERENCES "users"(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_income_type_active ON income_type(active);
CREATE INDEX idx_income_type_description ON income_type(description);

-- Add foreign key to person table
ALTER TABLE person
ADD COLUMN IF NOT EXISTS income_type_id INTEGER;

-- Add foreign key constraint (using DO block to check if it exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_person_income_type_id'
  ) THEN
    ALTER TABLE person
    ADD CONSTRAINT fk_person_income_type_id 
    FOREIGN KEY (income_type_id) REFERENCES income_type(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_person_income_type_id ON person(income_type_id);
