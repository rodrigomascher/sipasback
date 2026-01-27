-- Script de Seed para usuário de teste
-- Executar este script manualmente no SQL Editor do Supabase
-- Senha: admin123 (hash bcrypt)

-- Hash da senha: admin123
-- Gerado com bcrypt rounds 10
-- Hash: $2b$10$YIjlrPNoS0I1/6EWYvM5..RKaqfmHW1Fz9W.C8/tBd0qA8X9W4bGa

INSERT INTO public.users (email, name, password_hash, is_active)
VALUES (
  'admin@sipas.gov.br',
  'Administrador',
  '$2b$10$YIjlrPNoS0I1/6EWYvM5..RKaqfmHW1Fz9W.C8/tBd0qA8X9W4bGa',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Obter o ID do usuário criado
-- SELECT id FROM users WHERE email = 'admin@sipas.gov.br';

-- Criar um departamento para o usuário
INSERT INTO public.departments (name, description, is_active)
VALUES ('Administração', 'Departamento de Administração', true)
ON CONFLICT (name) DO NOTHING;

-- Criar uma unidade para o usuário
INSERT INTO public.units (name, type, city, state, is_active, created_by)
VALUES (
  'Unidade Central',
  'Sede',
  'Brasília',
  'DF',
  true,
  (SELECT id FROM users WHERE email = 'admin@sipas.gov.br' LIMIT 1)
)
ON CONFLICT (name) DO NOTHING;

-- Criar uma role para o usuário
INSERT INTO public.roles (name, description, is_active)
VALUES ('Administrador', 'Role de administrador do sistema', true)
ON CONFLICT (name) DO NOTHING;

-- Vincular usuário à unidade
INSERT INTO public.user_units (user_id, unit_id)
VALUES (
  (SELECT id FROM users WHERE email = 'admin@sipas.gov.br' LIMIT 1),
  (SELECT id FROM units WHERE name = 'Unidade Central' LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Vincular usuário ao departamento
INSERT INTO public.user_departments (user_id, department_id)
VALUES (
  (SELECT id FROM users WHERE email = 'admin@sipas.gov.br' LIMIT 1),
  (SELECT id FROM departments WHERE name = 'Administração' LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Vincular usuário à role
INSERT INTO public.user_roles (user_id, role_id)
VALUES (
  (SELECT id FROM users WHERE email = 'admin@sipas.gov.br' LIMIT 1),
  (SELECT id FROM roles WHERE name = 'Administrador' LIMIT 1)
)
ON CONFLICT DO NOTHING;
