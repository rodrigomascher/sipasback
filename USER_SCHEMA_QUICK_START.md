# 🚀 Nova Arquitetura User - Guia Rápido

## TL;DR (Muito Longo; Não Leu)

**Antes:** Um usuário = 1 unidade, 1 departamento, 1 cargo  
**Agora:** Um usuário = N unidades, N departamentos, N cargos  

---

## 📊 Estrutura Simplificada

```
users (10 campos essenciais)
  ├─ N ─ user_units ─ N ─ units
  ├─ N ─ user_departments ─ N ─ departments
  └─ N ─ user_roles ─ N ─ roles
```

---

## 🆕 Campos na Tabela Users

### Removidos ❌
- `unit_id` → Agora em `user_units` table
- `department_id` → Agora em `user_departments` table
- `role_id` → Agora em `user_roles` table

### Adicionados ✅
- `updated_by` - Quem modificou (BIGINT FK)
- `valid_until` - Data de expiração da conta (TIMESTAMP)
- `term_accepted_at` - Quando aceitou termos (TIMESTAMP)

---

## 🧮 Campos Mantidos ✓

```
id              - PK, auto-increment
email           - Unique, para login
password_hash   - Bcrypt hash
name            - Nome completo
employee_id     - FK employees
api_key         - Para acesso programático
is_active       - Boolean
last_login      - Último acesso
created_by      - Quem criou
created_at      - Data de criação
updated_at      - Data de atualização

// NOVOS
updated_by      - Quem atualizou
valid_until     - Válido até
term_accepted_at - Aceitou termos em
```

---

## 🔗 Tabelas de Junção

### user_units
```
(user_id, unit_id) = PK
assigned_at         - Quando
assigned_by         - Quem atribuiu (AUDIT)
```

### user_departments
```
(user_id, dept_id) = PK
assigned_at        - Quando
assigned_by        - Quem atribuiu (AUDIT)
```

### user_roles
```
(user_id, role_id) = PK
assigned_at       - Quando
assigned_by       - Quem atribuiu (AUDIT)
```

---

## 🔐 JWT Token (Agora Leve)

```json
{
  "sub": 1,
  "email": "admin@example.com",
  "name": "João Silva",
  "id": 1,
  "employeeId": 1,
  "isActive": true,
  "termAcceptedAt": "2026-01-21T...",
  "validUntil": "2027-01-21T...",
  "iat": 1705835704,
  "exp": 1705839304
}
```

**Relacionamentos agora carregam por demand via endpoints!**

---

## 🌐 Novos Endpoints

### Obter dados do usuário
```bash
GET /users/:id/units         # Todas as unidades
GET /users/:id/departments   # Todos os departamentos
GET /users/:id/roles         # Todos os cargos
```

### Atribuir/Remover
```bash
POST /users/:userId/assign-unit/:unitId
DELETE /users/:userId/units/:unitId

POST /users/:userId/assign-department/:deptId
DELETE /users/:userId/departments/:deptId

POST /users/:userId/assign-role/:roleId
DELETE /users/:userId/roles/:roleId
```

---

## 💾 Exemplo de Uso

### 1. Login
```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Response
{
  "access_token": "eyJhbGc...",
  "user": { id, email, name, ... }
}
```

### 2. Obter Unidades do Usuário
```bash
GET /users/1/units \
  -H "Authorization: Bearer $TOKEN"

# Response
[
  {
    "id": 1,
    "name": "Headquarters",
    "type": "Main",
    "city": "São Paulo",
    "state": "SP",
    "assignedAt": "2026-01-21T09:00:00Z",
    "assignedBy": null
  },
  {
    "id": 2,
    "name": "Branch Office",
    "type": "Secondary",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "assignedAt": "2026-01-22T14:00:00Z",
    "assignedBy": 1
  }
]
```

### 3. Atribuir Nova Unidade
```bash
POST /users/1/assign-unit/3 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Response
{
  "userId": 1,
  "unitId": 3,
  "assignedAt": "2026-01-21T15:00:00Z",
  "assignedBy": 1
}
```

### 4. Remover Unidade
```bash
DELETE /users/1/units/2 \
  -H "Authorization: Bearer $TOKEN"

# Response 204 No Content ou 200 OK
```

---

## 🔍 Queries Comuns

### Listar todos os usuários com suas unidades
```sql
SELECT 
  u.name,
  array_agg(un.name) as units
FROM users u
LEFT JOIN user_units uu ON u.id = uu.user_id
LEFT JOIN units un ON uu.unit_id = un.id
GROUP BY u.id, u.name;
```

### Encontrar quem tem acesso à unidade X
```sql
SELECT DISTINCT u.name
FROM user_units uu
JOIN users u ON uu.user_id = u.id
WHERE uu.unit_id = 1;
```

### Auditoria: Quem atribuiu cada permissão
```sql
SELECT 
  u.name as usuario,
  un.name as unidade,
  assigner.name as atribuido_por,
  uu.assigned_at
FROM user_units uu
JOIN users u ON uu.user_id = u.id
JOIN units un ON uu.unit_id = un.id
LEFT JOIN users assigner ON uu.assigned_by = assigner.id
ORDER BY uu.assigned_at DESC;
```

---

## ⚡ Benefícios

✅ **Flexibilidade**: Um usuário pode ter múltiplas unidades  
✅ **Escalabilidade**: Fácil adicionar/remover sem ALTER TABLE  
✅ **Auditoria**: Rastreia quem atribuiu o quê e quando  
✅ **Performance**: JWT é 50% menor (menos dados no token)  
✅ **Manutenção**: Mudanças não afetam a tabela users  

---

## 📝 Migração

### Passo 1: Executar Migration 003
```sql
-- Execute o arquivo:
db/migrations/003_restructure_user_relationships.sql
```

### Passo 2: Migrar Dados (se houver)
```sql
-- Mover dados existentes para junction tables
INSERT INTO user_units (user_id, unit_id, assigned_at, assigned_by)
SELECT id, unit_id, created_at, created_by 
FROM users 
WHERE unit_id IS NOT NULL;
```

### Passo 3: Remover Colunas Antigas
```sql
-- APENAS depois de confirmar migração!
ALTER TABLE users 
  DROP COLUMN unit_id,
  DROP COLUMN department_id,
  DROP COLUMN role_id;
```

---

## 🐛 Troubleshooting

### "Foreign key constraint violated"
- Certifique-se que a unidade/departamento/cargo existe
- Certifique-se que o usuário existe

### "Duplicate key value"
- Usuário já tem atribuição para esse recurso
- Use DELETE primeiro, depois POST

### "updated_by is NULL"
- Normal se criado antes da migration
- Será preenchido na próxima atualização

---

## 📚 Documentação Completa

- [USER_ENTITY_VISUAL.md](USER_ENTITY_VISUAL.md) - Diagramas e estrutura
- [USER_SCHEMA_CHANGES.md](USER_SCHEMA_CHANGES.md) - Mudanças detalhadas
- [db/migrations/003_restructure_user_relationships.sql](db/migrations/003_restructure_user_relationships.sql) - Script SQL
- [PHASE3_MODULES.md](PHASE3_MODULES.md) - API Reference completa

---

## ✨ Próximas Etapas

1. [ ] Executar migration 003
2. [ ] Atualizar código (remover unit_id/dept_id/role_id do JWT)
3. [ ] Implementar novos endpoints
4. [ ] Testar login e endpoints
5. [ ] Deploy em staging
6. [ ] Testes de aceitação
7. [ ] Deploy em produção

---

**Última atualização:** 21 de Janeiro de 2026  
**Status:** 🟢 Pronto para implementação
