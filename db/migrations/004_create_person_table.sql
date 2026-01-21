-- Create person table for SIPAS
CREATE TABLE IF NOT EXISTS person (
  -- System & Control
  id SERIAL PRIMARY KEY,
  created_by INT NOT NULL,
  updated_by INT,
  created_unit_id INT,
  updated_unit_id INT,
  referred_unit_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  notes TEXT,

  -- Basic Personal Data
  first_name VARCHAR(60),
  last_name VARCHAR(60),
  full_name VARCHAR(100),
  nickname TEXT,
  birth_date DATE,
  sex INT, -- 1=M, 2=F
  gender_id INT,
  gender_identity_id INT,
  sexual_orientation VARCHAR(1),
  race_id INT,
  ethnicity_id INT,
  community_id INT,
  marital_status_id INT,
  nationality INT,
  origin_country_id INT,
  arrival_date_brazil DATE,

  -- Filial Data (Parents) - can link to another person
  mother_person_id INT REFERENCES person(id) ON DELETE SET NULL,
  father_person_id INT REFERENCES person(id) ON DELETE SET NULL,
  mother_rg VARCHAR(15),
  father_rg VARCHAR(15),
  mother_residence_order INT,
  father_residence_order INT,

  -- General Documentation
  cpf VARCHAR(15) UNIQUE,
  nis NUMERIC(11),
  nisn VARCHAR(11),
  sus_number FLOAT,
  rg VARCHAR(20),
  rg_issuance_date DATE,
  rg_state_abbr CHAR(2),
  rg_issuing_org_id INT,
  rg_complementary VARCHAR(50),
  photo_id INT,

  -- Civil Registry Certificate
  cert_standard_new INT DEFAULT 1,
  cert_term_number VARCHAR(40),
  cert_book VARCHAR(20),
  cert_page CHAR(18),
  cert_issuance_date DATE,
  cert_state_abbr CHAR(2),
  cert_registry VARCHAR(6),
  cert_year VARCHAR(4),
  cert_issuing_org TEXT,
  birth_city VARCHAR(50),
  birth_subdistrict VARCHAR(50),

  -- Electoral, Professional & Military Documents
  voter_id_number VARCHAR(14),
  voter_id_zone VARCHAR(5),
  voter_id_section VARCHAR(4),
  voter_id_issuance_date DATE,
  prof_card_number VARCHAR(7),
  prof_card_series VARCHAR(5),
  prof_card_issuance_date DATE,
  prof_card_state VARCHAR(2),
  military_registration VARCHAR(15),
  military_issuance_date DATE,
  military_reserve_number VARCHAR(15),

  -- Income
  income_type_id INT,
  monthly_income DECIMAL(10,2),
  annual_income DECIMAL(12,2),

  -- Education
  education_level_id INT,
  school_name VARCHAR(100),
  completion_year INT,
  currently_studying INT, -- 1=yes, 0=no

  -- Death Data (if applicable)
  deceased INT, -- 1=yes, 0=no
  death_cert_issuance_date DATE,
  death_city VARCHAR(50),
  cemetery VARCHAR(50)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_person_cpf ON person(cpf);
CREATE INDEX IF NOT EXISTS idx_person_nis ON person(nis);
CREATE INDEX IF NOT EXISTS idx_person_first_name ON person(first_name);
CREATE INDEX IF NOT EXISTS idx_person_last_name ON person(last_name);
CREATE INDEX IF NOT EXISTS idx_person_birth_date ON person(birth_date);
CREATE INDEX IF NOT EXISTS idx_person_created_by ON person(created_by);
CREATE INDEX IF NOT EXISTS idx_person_created_at ON person(created_at);
CREATE INDEX IF NOT EXISTS idx_person_mother_person_id ON person(mother_person_id);
CREATE INDEX IF NOT EXISTS idx_person_father_person_id ON person(father_person_id);

-- Create person_social_programs table for social programs linkage
CREATE TABLE IF NOT EXISTS person_social_programs (
  id SERIAL PRIMARY KEY,
  person_id INT NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  program_id INT NOT NULL,
  enrollment_date DATE,
  status VARCHAR(20), -- active, inactive, pending
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(person_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_person_social_programs_person_id ON person_social_programs(person_id);
CREATE INDEX IF NOT EXISTS idx_person_social_programs_program_id ON person_social_programs(program_id);
CREATE INDEX IF NOT EXISTS idx_person_social_programs_status ON person_social_programs(status);

-- Create person_addresses table for addresses
CREATE TABLE IF NOT EXISTS person_addresses (
  id SERIAL PRIMARY KEY,
  person_id INT NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  address_type VARCHAR(20), -- residential, commercial, etc
  street VARCHAR(100),
  number VARCHAR(10),
  complement VARCHAR(50),
  neighborhood VARCHAR(50),
  city VARCHAR(50),
  state CHAR(2),
  zipcode VARCHAR(10),
  is_main INT DEFAULT 1, -- 1=main address, 0=secondary
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_person_addresses_person_id ON person_addresses(person_id);
CREATE INDEX IF NOT EXISTS idx_person_addresses_is_main ON person_addresses(is_main);
