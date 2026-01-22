# 📋 Resumo das Mudanças na Entidade User

## Data: 21 de Janeiro de 2026

---

## 1. Campos Removidos da Tabela `users`

```
❌ unit_id (BIGINT FK)          - Referência direta à unidade
❌ department_id (BIGINT FK)    - Referência direta ao departamento
❌ role_id (BIGINT FK)          - Referência direta ao cargo
```

**Motivo:** Estes campos limitavam cada usuário a apenas uma unidade, departamento e cargo. O novo modelo N:M permite flexibilidade total.

---

## 2. Campos Adicionados à Tabela `users`

```
✅ updated_by (BIGINT FK users.id)           - Quem fez a última modificação
✅ valid_until (TIMESTAMP WITH TIME ZONE)    - Data de validade da conta
✅ term_accepted_at (TIMESTAMP WITH TIME ZONE) - Quando aceitou os termos
```

---

## 3. Tabelas de Junção (N:M) Adicionadas

### 3.1 Tabela: `user_units`

```sql
CREATE TABLE user_units (
  user_id BIGINT NOT NULL (FK users.id),
  unit_id BIGINT NOT NULL (FK units.id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by BIGINT (FK users.id) -- Auditoria
  PRIMARY KEY (user_id, unit_id)
);
```

**Um usuário pode estar em múltiplas unidades:**
```
João Silva
  ├─ Headquarters (atribuído em 2026-01-21 por Admin)
  ├─ Branch Office (atribuído em 2026-01-22 por Admin)
  └─ Regional Center (atribuído em 2026-01-23 por Gerente)
```

### 3.2 Tabela: `user_departments`

```sql
CREATE TABLE user_departments (
  user_id BIGINT NOT NULL (FK users.id),
  dept_id BIGINT NOT NULL (FK departments.id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by BIGINT (FK users.id) -- Auditoria
  PRIMARY KEY (user_id, dept_id)
);
```

**Um usuário pode estar em múltiplos departamentos:**
```
João Silva
  ├─ Administration
  ├─ Engineering
  └─ Support
```

### 3.3 Tabela: `user_roles`

```sql
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL (FK users.id),
  role_id BIGINT NOT NULL (FK roles.id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by BIGINT (FK users.id) -- Auditoria
  PRIMARY KEY (user_id, role_id)
);
```

**Um usuário pode ter múltiplos cargos:**
```
João Silva
  ├─ Administrator (global)
  ├─ Engineer (Headquarters)
  ├─ Manager (Branch Office)
  └─ Technician (Regional Center)
```

---

## 4. Impacto no JWT Token

### Antes (Pesado)
```json
{
  "sub": 1,
  "email": "admin@example.com",
  "name": "João Silva",
  "id": 1,
  "employeeId": 1,
  "unitId": 1,
  "unitName": "Headquarters",
  "unitType": "Main",
  "departmentId": 1,
  "departmentName": "Admin",
  "roleId": 1,
  "roleName": "Administrator",
  "isTechnician": false,
  "isArmoredUnit": true,
  "city": "São Paulo",
  "state": "SP",
  "iat": 1705835704,
  "exp": 1705839304
}
```

### Depois (Leve)
```json
{
  "sub": 1,
  "email": "admin@example.com",
  "name": "João Silva",
  "id": 1,
  "employeeId": 1,
  "isActive": true,
  "termAcceptedAt": "2026-01-21T10:33:04Z",
  "validUntil": "2027-01-21T10:33:04Z",
  "iat": 1705835704,
  "exp": 1705839304
}
```

**Benefício:** Token é 50% menor. Relacionamentos carregados sob demanda via endpoints.

---

## 5. Novos Endpoints para Carregar Dados

```bash
# Obter todas as unidades de um usuário
GET /users/:id/units
Response: Array<{id, name, type, city, state, assignedAt, assignedBy}>

# Obter todos os departamentos de um usuário
GET /users/:id/departments
Response: Array<{id, name, assignedAt, assignedBy}>

# Obter todos os cargos de um usuário
GET /users/:id/roles
Response: Array<{id, name, isTechnician, assignedAt, assignedBy}>

# Atribuir unidade a usuário
POST /users/:userId/assign-unit/:unitId

# Remover unidade de usuário
DELETE /users/:userId/units/:unitId

# Similar para departments e roles
```

---

## 6. Exemplo de Fluxo Completo

### 1. Usuario faz login
```
POST /auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

Response:
{
  "access_token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "João Silva",
    "isActive": true,
    ...
  }
}
```

### 2. Frontend armazena token
```javascript
localStorage.setItem('token', access_token);
```

### 3. Frontend busca dados completos (opcional)
```javascript
// Se precisar dos relacionamentos
const unitsResponse = await fetch('/users/1/units', {
  headers: { Authorization: `Bearer ${token}` }
});

const units = await unitsResponse.json();
// [
//   { id: 1, name: 'Headquarters', city: 'São Paulo', ... },
//   { id: 2, name: 'Branch Office', city: 'Rio de Janeiro', ... }
// ]
```

### 4. Frontend envia requests com token
```javascript
const response = await fetch('/units', {
  headers: { Authorization: `Bearer ${token}` }
});

// JWT payload é validado
// user.id é usado para audit trail (created_by, updated_by)
```

---

## 7. Benefícios da Nova Arquitetura

| Aspecto | Antes | Depois |
|---------|--------|--------|
| **Unidades por usuário** | 1 | Ilimitado |
| **Departamentos por usuário** | 1 | Ilimitado |
| **Cargos por usuário** | 1 | Ilimitado |
| **JWT Token Size** | ~500 bytes | ~250 bytes |
| **Auditoria** | Básica (created_by) | Completa (assigned_by em cada tabela) |
| **Flexibilidade** | Baixa (precisa alterar users) | Alta (apenas adiciona linha em junction) |
| **Escalabilidade** | Limitada | Muito boa |

---

## 8. Exemplos SQL

### Listar todos os usuários com suas permissões

```sql
SELECT 
  u.id,
  u.name,
  u.email,
  array_agg(DISTINCT un.name) as units,
  array_agg(DISTINCT dep.name) as departments,
  array_agg(DISTINCT r.name) as roles
FROM public.users u
LEFT JOIN public.user_units uu ON u.id = uu.user_id
LEFT JOIN public.units un ON uu.unit_id = un.id
LEFT JOIN public.user_departments ud ON u.id = ud.user_id
LEFT JOIN public.departments dep ON ud.dept_id = dep.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id
WHERE u.is_active = true
GROUP BY u.id, u.name, u.email;
```

### Encontrar quem atribuiu cada permissão

```sql
SELECT 
  u.name as usuario,
  'Unit' as tipo,
  un.name as recurso,
  assigner.name as atribuido_por,
  uu.assigned_at as quando
FROM public.user_units uu
JOIN public.users u ON uu.user_id = u.id
JOIN public.units un ON uu.unit_id = un.id
LEFT JOIN public.users assigner ON uu.assigned_by = assigner.id
ORDER BY uu.assigned_at DESC;
```

---

## 9. Processo de Migração

### Passo 1: Executar migration 003
```sql
-- Cria as 3 tabelas de junção
-- Adiciona novos campos à tabela users
-- Cria índices para performance
```

### Passo 2: Migrar dados existentes (opcional)
```sql
-- Se você tem dados em unit_id, department_id, role_id:
INSERT INTO user_units (user_id, unit_id, assigned_at, assigned_by)
SELECT id, unit_id, created_at, created_by 
FROM users 
WHERE unit_id IS NOT NULL;

-- Similar para departments e roles
```

### Passo 3: Remover colunas antigas
```sql
-- APENAS depois de migrar os dados!
ALTER TABLE users 
  DROP COLUMN unit_id,
  DROP COLUMN department_id,
  DROP COLUMN role_id;
```

---

## 10. Checklist de Implementação

- [ ] Executar migration 003 no Supabase
- [ ] Verificar se as 3 tabelas foram criadas
- [ ] Verificar se as novas colunas foram adicionadas
- [ ] Migrar dados existentes (se houver)
- [ ] Atualizar TypeScript interfaces
- [ ] Criar novos endpoints (/users/:id/units, etc.)
- [ ] Criar novos endpoints de atribuição (/users/:id/assign-unit/:id, etc.)
- [ ] Atualizar JWT service (remover unit/dept/role)
- [ ] Atualizar AuthService
- [ ] Testar login
- [ ] Testar endpoints de usuário
- [ ] Testar endpoints de atribuição
- [ ] Atualizar documentação da API
- [ ] Deploy em staging
- [ ] Testes de aceitação
- [ ] Deploy em produção

---

## 11. Rollback (se necessário)

```sql
-- Mover dados de volta para users table
INSERT INTO users (id, unit_id, department_id, role_id)
SELECT DISTINCT 
  u.id,
  (SELECT unit_id FROM user_units WHERE user_id = u.id LIMIT 1),
  (SELECT dept_id FROM user_departments WHERE user_id = u.id LIMIT 1),
  (SELECT role_id FROM user_roles WHERE user_id = u.id LIMIT 1)
FROM users u;

-- Dropar tabelas de junção
DROP TABLE user_units;
DROP TABLE user_departments;
DROP TABLE user_roles;

-- Remover colunas novas
ALTER TABLE users 
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS valid_until,
  DROP COLUMN IF EXISTS term_accepted_at;
```

---

## Contato & Dúvidas

Para dúvidas sobre esta migração, consulte:
- USER_ENTITY_VISUAL.md - Documentação visual da entidade
- db/migrations/003_restructure_user_relationships.sql - Script SQL
- Esta documentação
