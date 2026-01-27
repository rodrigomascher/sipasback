INSERT INTO marital_status (description, active) VALUES
  ('Solteiro(a)', true),
  ('Casado(a)', true),
  ('Separado(a)', true),
  ('Divorciado(a)', true),
  ('Viúvo(a)', true),
  ('União Estável', true),
  ('Não informado', true)
ON CONFLICT (description) DO NOTHING;
