-- Seed ethnicity data
INSERT INTO ethnicity (description, active, created_by, created_at) VALUES
('Indígena Isolada', true, 1, CURRENT_TIMESTAMP),
('Indígena Aldeada', true, 1, CURRENT_TIMESTAMP),
('Afrodescendente', true, 1, CURRENT_TIMESTAMP),
('Cigana', true, 1, CURRENT_TIMESTAMP),
('Quilombola', true, 1, CURRENT_TIMESTAMP),
('Imigrante', true, 1, CURRENT_TIMESTAMP),
('Refugiada', true, 1, CURRENT_TIMESTAMP)
ON CONFLICT (description) DO NOTHING;

-- Add additional ethnicity options as needed
INSERT INTO ethnicity (description, active, created_by, created_at) VALUES
('Não informado', true, 1, CURRENT_TIMESTAMP),
('Prefiro não responder', true, 1, CURRENT_TIMESTAMP)
ON CONFLICT (description) DO NOTHING;
