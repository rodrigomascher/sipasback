# 🔄 Comparação: Modelo Antigo vs. Novo

## 📊 Estrutura da Tabela Users

### ANTES (1:1 Relationship)

```
┌──────────────────────────────────────────────┐
│              users (1-to-1)                  │
├──────────────────────────────────────────────┤
│ id                 → 1                        │
│ email              → admin@example.com        │
│ password_hash      → $2b$10$...              │
│ name               → João Silva               │
│ unit_id            → 1 ────┐                 │
│ department_id      → 1 ─┐  │                 │
│ role_id            → 1  │  │                 │
│ employee_id        → 1  │  │                 │
│ api_key            → null  │  │                 │
│ is_active          → true  │  │                 │
│ last_login         → 2026-01-21  │  │          │
│ created_by         → null  │  │                 │
│ created_at         → 2026-01-21  │  │          │
│ updated_at         → 2026-01-21  │  │          │
└──────────────────────────────────────────────┘
        │         │          │
        │         │          └─────────────────────┐
        │         └──────────────┐                │
        └──────────┐             │                │
                   │             │                │
                   ▼             ▼                ▼
            ┌──────────┐   ┌─────────────┐  ┌────────────┐
            │ units    │   │departments  │  │   roles    │
            ├──────────┤   ├─────────────┤  ├────────────┤
            │ id: 1    │   │ id: 1       │  │ id: 1      │
            │ name     │   │ name        │  │ name       │
            └──────────┘   └─────────────┘  └────────────┘

❌ PROBLEMA: João só pode ser admin de 1 unidade, 1 departamento, 1 cargo
```

---

### DEPOIS (N:M Relationship)

```
┌──────────────────────────────────────────────┐
│           users (Core Data Only)             │
├──────────────────────────────────────────────┤
│ id                 → 1                        │
│ email              → admin@example.com        │
│ password_hash      → $2b$10$...              │
│ name               → João Silva               │
│ employee_id        → 1                        │
│ api_key            → null                     │
│ is_active          → true                     │
│ last_login         → 2026-01-21               │
│ created_by         → null                     │
│ updated_by         → null (NEW)               │
│ valid_until        → 2027-01-21 (NEW)         │
│ term_accepted_at   → 2026-01-21 (NEW)         │
│ created_at         → 2026-01-21               │
│ updated_at         → 2026-01-21               │
└──────────────────────────────────────────────┘
        │
        ├─────────────────────────────────────────┬────────────────────────────────┐
        │                                         │                                │
        ▼                                         ▼                                ▼
┌───────────────────────┐              ┌───────────────────────┐       ┌───────────────────────┐
│   user_units (N:M)    │              │ user_departments(N:M) │       │  user_roles (N:M)     │
├───────────────────────┤              ├───────────────────────┤       ├───────────────────────┤
│ user_id     → 1       │              │ user_id     → 1       │       │ user_id     → 1       │
│ unit_id     → 1       │              │ dept_id     → 1       │       │ role_id     → 1       │
│ assigned_at → 2026-01 │              │ assigned_at → 2026-01 │       │ assigned_at → 2026-01 │
│ assigned_by → null    │              │ assigned_by → null    │       │ assigned_by → null    │
├───────────────────────┤              ├───────────────────────┤       ├───────────────────────┤
│ user_id     → 1       │              │ user_id     → 1       │       │ user_id     → 1       │
│ unit_id     → 2       │              │ dept_id     → 2       │       │ role_id     → 2       │
│ assigned_at → 2026-01 │              │ assigned_at → 2026-01 │       │ assigned_at → 2026-01 │
│ assigned_by → 1       │              │ assigned_by → null    │       │ assigned_by → 1       │
├───────────────────────┤              ├───────────────────────┤       ├───────────────────────┤
│ user_id     → 1       │              │ user_id     → 1       │       │ user_id     → 1       │
│ unit_id     → 3       │              │ dept_id     → 3       │       │ role_id     → 3       │
│ assigned_at → 2026-01 │              │ assigned_at → 2026-01 │       │ assigned_at → 2026-01 │
│ assigned_by → 1       │              │ assigned_by → 1       │       │ assigned_by → 1       │
└───────────┬───────────┘              └───────────┬───────────┘       └───────────┬───────────┘
            │                                      │                             │
            │                                      │                             │
            ├─────────────────────────────────────┼─────────────────────────────┤
            │                                      │                             │
            ▼                                      ▼                             ▼
      ┌───────────────┐              ┌──────────────────────┐         ┌────────────────┐
      │    units      │              │   departments        │         │     roles      │
      ├───────────────┤              ├──────────────────────┤         ├────────────────┤
      │ id: 1 (HQ)    │              │ id: 1 (Admin)        │         │ id: 1 (Admin)  │
      │ id: 2 (Branch)│              │ id: 2 (Engineering)  │         │ id: 2 (Engineer)
      │ id: 3 (Region)│              │ id: 3 (Support)      │         │ id: 3 (Tech)   │
      └───────────────┘              └──────────────────────┘         └────────────────┘

✅ VANTAGEM: João pode ser admin de 3 unidades, 3 departamentos, 3 cargos simultaneamente
```

---

## 📈 Exemplo Real

### João Silva - Antes

```
┌─ id: 1
├─ email: joao@sipas.com
├─ name: João Silva
├─ unit_id: 1 ─────────────────────┐
├─ department_id: 1 ───────────────┼────┐
├─ role_id: 1 ──────────────────────┼────┼────┐
└─ is_active: true                  │    │    │
                                    ▼    ▼    ▼
                            Headquarters
                            Administration
                            Administrator

❌ João SÓ pode estar em 1 unidade/departamento/cargo
```

### João Silva - Depois

```
┌─ id: 1
├─ email: joao@sipas.com
├─ name: João Silva
├─ valid_until: 2027-01-21
├─ term_accepted_at: 2026-01-21
├─ is_active: true
│
├─ UNIDADES (via user_units):
│  ├─ 1 → Headquarters (atrib. em 2026-01-21 por null)
│  ├─ 2 → Branch Office (atrib. em 2026-01-22 por Admin)
│  └─ 3 → Regional Center (atrib. em 2026-01-23 por Gerente)
│
├─ DEPARTAMENTOS (via user_departments):
│  ├─ 1 → Administration (atrib. em 2026-01-21 por null)
│  ├─ 2 → Engineering (atrib. em 2026-01-22 por null)
│  └─ 3 → Support (atrib. em 2026-01-23 por Admin)
│
└─ CARGOS (via user_roles):
   ├─ 1 → Administrator (atrib. em 2026-01-21 por null)
   ├─ 2 → Engineer (atrib. em 2026-01-22 por Admin)
   └─ 3 → Technician (atrib. em 2026-01-23 por Gerente)

✅ João pode estar em 3 unidades, 3 departamentos, 3 cargos simultaneamente!
```

---

## 🔐 JWT Token Comparison

### ANTES (Pesado - ~500 bytes)

```json
{
  "sub": 1,
  "email": "joao@sipas.com",
  "name": "João Silva",
  "id": 1,
  "employeeId": 1,
  "unitId": 1,
  "unitName": "Headquarters",
  "unitType": "Main",
  "unitCity": "São Paulo",
  "unitState": "SP",
  "departmentId": 1,
  "departmentName": "Administration",
  "roleId": 1,
  "roleName": "Administrator",
  "isTechnician": false,
  "isArmoredUnit": false,
  "city": "São Paulo",
  "state": "SP",
  "iat": 1705835704,
  "exp": 1705839304
}

Total: 15 campos
Size: ~500 bytes
```

### DEPOIS (Leve - ~250 bytes)

```json
{
  "sub": 1,
  "email": "joao@sipas.com",
  "name": "João Silva",
  "id": 1,
  "employeeId": 1,
  "isActive": true,
  "termAcceptedAt": "2026-01-21T10:33:04Z",
  "validUntil": "2027-01-21T10:33:04Z",
  "iat": 1705835704,
  "exp": 1705839304
}

Total: 10 campos
Size: ~250 bytes
Performance: 50% melhor!
```

---

## 📡 Fluxo de Requisição

### ANTES

```
Cliente                Backend                Database
  │                      │                       │
  ├─ LOGIN ────────────> │                       │
  │                      ├─ SELECT users ──────> │
  │                      │ WHERE id = 1          │
  │                      │ <─ FULL USER (1,1,1)  │
  │                      ├─ Cria JWT (15 campos) │
  │                      │                       │
  │ <──── JWT token ────│                        │
  │ (Já tem unit/dept/role)                      │
  │                                              │
  ├─ GET /units ──────> │                        │
  │ (Authorization: Bearer JWT)                  │
  │                      ├─ Valida JWT ─────────> (via função)
  │                      ├─ Extrai unit_id = 1  │
  │                      ├─ SELECT units ──────> │
  │                      │ WHERE id = 1          │
  │                      │ <─ 1 unit              │
  │                      │                       │
  │ <─ [1 unit] ────────│                        │
```

### DEPOIS

```
Cliente                Backend                Database
  │                      │                       │
  ├─ LOGIN ────────────> │                       │
  │                      ├─ SELECT users ──────> │
  │                      │ WHERE id = 1          │
  │                      │ <─ USER (core only)   │
  │                      ├─ Cria JWT (10 campos)│
  │                      │ (50% menor!)          │
  │                      │                       │
  │ <──── JWT token ────│                        │
  │ (Apenas dados essenciais)                    │
  │                                              │
  ├─ GET /users/1/units > │                      │
  │ (Authorization: Bearer JWT)                  │
  │                      ├─ Valida JWT ────────> (via função)
  │                      ├─ SELECT user_units ─> │
  │                      │ WHERE user_id = 1     │
  │                      │ <─ 3 rows (unit 1,2,3)
  │                      ├─ SELECT units ──────> │
  │                      │ WHERE id IN (1,2,3)   │
  │                      │ <─ 3 units             │
  │                      │                       │
  │ <─ [3 units] ──────│                         │
```

---

## 📊 Comparação de Performance

| Métrica | Antes | Depois | Melhoria |
|---------|--------|--------|----------|
| JWT Token Size | ~500 bytes | ~250 bytes | -50% |
| Fields in Token | 15 | 10 | -33% |
| Query para unidades | 1 (via unit_id) | 2 (user_units + units) | +1 query |
| Unidades por usuário | 1 | N (ilimitado) | ∞ |
| Flexibility | Baixa | Alta | +++++ |
| Update table on change | SIM | NÃO | ✅ |

---

## 🔄 Migração: Passos

### 1. Backup
```sql
-- Fazer backup dos dados atuais
CREATE TABLE users_backup AS SELECT * FROM users;
```

### 2. Executar Migration
```sql
-- db/migrations/003_restructure_user_relationships.sql
-- Cria as 3 tabelas de junção
```

### 3. Migrar Dados Existentes
```sql
-- Mover dados de unit_id → user_units
INSERT INTO user_units (user_id, unit_id, assigned_at, assigned_by)
SELECT id, unit_id, created_at, created_by 
FROM users 
WHERE unit_id IS NOT NULL;

-- Similar para departments e roles
```

### 4. Verificar Integridade
```sql
-- Confirmar que todos os dados foram migrados
SELECT COUNT(*) FROM user_units;      -- Deve ter X registros
SELECT COUNT(*) FROM user_departments;-- Deve ter Y registros
SELECT COUNT(*) FROM user_roles;      -- Deve ter Z registros
```

### 5. Remover Colunas Antigas
```sql
-- APENAS depois de confirmar que migração funcionou!
ALTER TABLE users 
  DROP COLUMN unit_id,
  DROP COLUMN department_id,
  DROP COLUMN role_id;
```

### 6. Atualizar Código
```
- AuthService: JWT agora com 10 campos
- Controllers: Novos endpoints para get/assign/remove
- Services: Queries para junction tables
- Interfaces: UserSession sem unitId/deptId/roleId
```

### 7. Testar
```
✓ Login
✓ GET /users/1/units
✓ POST /users/1/assign-unit/2
✓ DELETE /users/1/units/1
✓ Similar para departments e roles
```

---

## ✨ Benefícios Resumidos

```
┌─────────────────────────────────────────────────────────────────┐
│                     BENEFÍCIOS DO NOVO MODELO                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 🚀 FLEXIBILIDADE                                               │
│    Um usuário pode ter múltiplas unidades/departments/roles    │
│                                                                  │
│ 📊 AUDITORIA COMPLETA                                          │
│    Cada atribuição tem timestamp + quem atribuiu               │
│                                                                  │
│ ⚡ PERFORMANCE                                                 │
│    JWT 50% menor, queries mais específicas                     │
│                                                                  │
│ 🔧 MANUTENÇÃO                                                  │
│    Mudanças não requerem ALTER TABLE                           │
│                                                                  │
│ 📈 ESCALABILIDADE                                              │
│    Fácil adicionar mais relacionamentos (ex: user_projects)   │
│                                                                  │
│ 🎯 FUTURO-PROVA                                                │
│    Design permite crescimento sem breaking changes             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Relacionamentos Futuros (Fáceis de Adicionar)

```
user_projects    ─── projects
user_teams       ─── teams
user_permissions ─── permissions
user_workflows   ─── workflows
```

Todos com o mesmo padrão:
- (user_id, resource_id) = PK
- assigned_at, assigned_by
- Sem tocar na tabela users!

---

**Conclusão:** O novo modelo oferece muito mais flexibilidade mantendo código limpo e performance otimizada.
