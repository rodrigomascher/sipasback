-- Seed ethnicity data
INSERT INTO ethnicity (description, active, created_at) VALUES
('Indígena Isolada', true, CURRENT_TIMESTAMP),
('Indígena Aldeada', true, CURRENT_TIMESTAMP),
('Afrodescendente', true, CURRENT_TIMESTAMP),
('Cigana', true, CURRENT_TIMESTAMP),
('Quilombola', true, CURRENT_TIMESTAMP),
('Imigrante', true, CURRENT_TIMESTAMP),
('Refugiada', true, CURRENT_TIMESTAMP)
ON CONFLICT (description) DO NOTHING;

-- Add additional ethnicity options as needed
INSERT INTO ethnicity (description, active, created_by, created_at) VALUES
('Não informado', true, 1, CURRENT_TIMESTAMP),
('Prefiro não responder', true, 1, CURRENT_TIMESTAMP)
ON CONFLICT (description) DO NOTHING;
