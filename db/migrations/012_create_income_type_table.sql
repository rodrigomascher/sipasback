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
ADD COLUMN if NOT EXISTS income_type_id INTEGER REFERENCES income_type(id) ON DELETE SET NULL;

CREATE INDEX idx_person_income_type_id ON person(income_type_id);
