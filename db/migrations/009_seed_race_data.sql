-- Seed race/color data
INSERT INTO race (description, active, created_by, created_at) VALUES
('Branca', true, 1, CURRENT_TIMESTAMP),
('Preta', true, 1, CURRENT_TIMESTAMP),
('Amarela', true, 1, CURRENT_TIMESTAMP),
('Parda', true, 1, CURRENT_TIMESTAMP),
('Indígena', true, 1, CURRENT_TIMESTAMP)
ON CONFLICT (description) DO NOTHING;

-- Add any additional race/color options as needed
INSERT INTO race (description, active, created_by, created_at) VALUES
('Não informado', true, 1, CURRENT_TIMESTAMP),
('Prefiro não responder', true, 1, CURRENT_TIMESTAMP)
ON CONFLICT (description) DO NOTHING;
