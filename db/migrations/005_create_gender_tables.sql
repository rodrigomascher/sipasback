-- Create gender table
CREATE TABLE gender (
  id SERIAL PRIMARY KEY,
  description VARCHAR(100) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL,
  updated_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gender_description ON gender(description);
CREATE INDEX idx_gender_active ON gender(active);

-- Create gender_identity table
CREATE TABLE gender_identity (
  id SERIAL PRIMARY KEY,
  description VARCHAR(100) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL,
  updated_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gender_identity_description ON gender_identity(description);
CREATE INDEX idx_gender_identity_active ON gender_identity(active);

-- Create sexual_orientation table
CREATE TABLE sexual_orientation (
  id SERIAL PRIMARY KEY,
  description VARCHAR(100) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL,
  updated_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sexual_orientation_description ON sexual_orientation(description);
CREATE INDEX idx_sexual_orientation_active ON sexual_orientation(active);

-- Add foreign key constraints to person table for gender and sexual_orientation
ALTER TABLE person
ADD CONSTRAINT fk_person_gender_id FOREIGN KEY (gender_id) REFERENCES gender(id) ON DELETE SET NULL;

ALTER TABLE person
ADD CONSTRAINT fk_person_gender_identity_id FOREIGN KEY (gender_identity_id) REFERENCES gender_identity(id) ON DELETE SET NULL;

-- Note: sexual_orientation in person is stored as text, can be migrated to ID reference later if needed
