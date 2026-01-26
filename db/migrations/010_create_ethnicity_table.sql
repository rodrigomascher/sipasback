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
ADD COLUMN if not EXISTS ethnicity_id INTEGER,
ADD CONSTRAINT fk_person_ethnicity_id FOREIGN KEY (ethnicity_id) REFERENCES ethnicity(id) ON DELETE SET NULL;

-- Create index for ethnicity_id in person table
CREATE INDEX idx_person_ethnicity_id ON person(ethnicity_id);
