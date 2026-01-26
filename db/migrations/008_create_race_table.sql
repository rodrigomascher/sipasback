-- Create race table
CREATE TABLE race (
  id SERIAL PRIMARY KEY,
  description VARCHAR(100) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL,
  updated_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_race_description ON race(description);
CREATE INDEX idx_race_active ON race(active);

-- Add race_id column to person table
ALTER TABLE person
ADD COLUMN race_id INTEGER,
ADD CONSTRAINT fk_person_race_id FOREIGN KEY (race_id) REFERENCES race(id) ON DELETE SET NULL;

-- Create index for race_id in person table
CREATE INDEX idx_person_race_id ON person(race_id);
