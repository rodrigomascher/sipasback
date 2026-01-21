# 👤 Entidade de Usuário (User) - Visualização

## 1. Estrutura do Banco de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                         TABLE: users                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📌 id (BIGSERIAL PRIMARY KEY)                                  │
│     └─ Identificador único do usuário                          │
│     └─ Auto-incrementado                                        │
│     └─ Exemplo: 1, 2, 3, ...                                  │
│                                                                   │
│  📧 email (VARCHAR(255) UNIQUE NOT NULL)                        │
│     └─ Email único para login                                  │
│     └─ Exemplo: admin@example.com                             │
│                                                                   │
│  🔐 password_hash (VARCHAR(255) NOT NULL)                       │
│     └─ Senha hashizada com bcrypt                             │
│     └─ Nunca armazena senha em texto plano                    │
│     └─ Exemplo: $2b$10$abcdefghijklmnop...                   │
│                                                                   │
│  👤 name (VARCHAR(255) NOT NULL)                                │
│     └─ Nome completo do usuário                               │
│     └─ Exemplo: João Silva                                    │
│                                                                   │
│  � employee_id (BIGINT FK employees.id)                        │
│     └─ Referência ao registro de funcionário                 │
│     └─ Referencia table: employees                           │
│     └─ Pode ser NULL                                         │
│     └─ Exemplo: 1                                            │
│                                                                   │
│  🔑 api_key (VARCHAR(255) UNIQUE)                               │
│     └─ Chave de API para acesso programático                 │
│     └─ Pode ser NULL                                         │
│     └─ Gerada automaticamente                                │
│                                                                   │
│  ✅ is_active (BOOLEAN DEFAULT TRUE)                            │
│     └─ Indica se o usuário está ativo                        │
│     └─ Pode ser usado para desativar sem deletar            │
│     └─ true = ativo, false = inativo                        │
│                                                                   │
│  🕐 last_login (TIMESTAMP WITH TIME ZONE)                       │
│     └─ Data e hora do último login                           │
│     └─ Pode ser NULL (nunca fez login)                       │
│     └─ Exemplo: 2026-01-21T10:33:04Z                        │
│                                                                   │
│  👤 created_by (BIGINT FK users.id) - AUDIT                     │
│     └─ Usuário que criou esta conta                          │
│     └─ Pode ser NULL                                         │
│     └─ Exemplo: 1 (admin criou outro usuário)              │
│                                                                   │
│  👤 updated_by (BIGINT FK users.id) - AUDIT                     │
│     └─ Usuário que último modificou esta conta               │
│     └─ Pode ser NULL                                         │
│     └─ Exemplo: 1 (admin atualizou)                         │
│                                                                   │
│  ⏰ valid_until (TIMESTAMP WITH TIME ZONE)                      │
│     └─ Data de validade da conta (ex: contrato temporário)    │
│     └─ Pode ser NULL (sem expiração)                         │
│     └─ Exemplo: 2027-01-21T10:33:04Z                        │
│                                                                   │
│  ✍️  term_accepted_at (TIMESTAMP WITH TIME ZONE)               │
│     └─ Quando o usuário aceitou os termos                    │
│     └─ Pode ser NULL (ainda não aceitou)                    │
│     └─ Exemplo: 2026-01-21T10:33:04Z                        │
│                                                                   │
│  ⏰ created_at (TIMESTAMP DEFAULT NOW())                        │
│     └─ Quando o usuário foi criado                           │
│     └─ Exemplo: 2026-01-21T10:00:00Z                        │
│                                                                   │
│  ⏰ updated_at (TIMESTAMP DEFAULT NOW())                        │
│     └─ Quando o usuário foi atualizado                       │
│     └─ Exemplo: 2026-01-21T10:30:00Z                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

⚡ NOVOS RELACIONAMENTOS (Many-to-Many):
   └─ Um usuário pode estar em múltiplas unidades
   └─ Um usuário pode ter múltiplos departamentos
   └─ Um usuário pode ter múltiplos cargos/funções
```

## 2. Relacionamentos (Many-to-Many)

```
┌──────────────────────────────────────────────────────────────────┐
│                         users (Principal)                        │
│                    ┌──────────────────────┐                      │
│                    │ id, email, password  │                      │
│                    │ name, employee_id    │                      │
│                    │ api_key, is_active   │                      │
│                    │ last_login           │                      │
│                    │ created_by, updated  │                      │
│                    │ valid_until          │                      │
│                    │ term_accepted_at     │                      │
│                    └──────────────┬───────┘                      │
└──────────────────────────────────┼──────────────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────┐
          │                        │                    │
          ▼                        ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  user_units      │  │ user_departments │  │   user_roles     │
│   (N:M JOIN)     │  │   (N:M JOIN)     │  │   (N:M JOIN)     │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ user_id (FK)     │  │ user_id (FK)     │  │ user_id (FK)     │
│ unit_id (FK) ────┼──┘ dept_id (FK) ────┼──┘ role_id (FK) ────┼──┐
│ assigned_at      │  │ assigned_at      │  │ assigned_at      │  │
│ assigned_by      │  │ assigned_by      │  │ assigned_by      │  │
└──────────────────┘  └──────────────────┘  └──────────────────┘  │
          │                    │                    │              │
          │                    │                    │              │
          ▼                    ▼                    ▼              │
   ┌────────────┐        ┌──────────────┐   ┌────────────┐       │
   │   units    │        │ departments  │   │   roles    │◄──────┘
   ├────────────┤        ├──────────────┤   ├────────────┤
   │ id (PK)    │        │ id (PK)      │   │ id (PK)    │
   │ name       │        │ name         │   │ name       │
   │ type       │        │ unit_id (FK) │   │ description│
   │ city       │        │              │   │ is_tech... │
   │ state      │        └──────────────┘   └────────────┘
   └────────────┘
        ▲
        │
        └──────────────────┐
                           │
                  ┌────────────────┐
                  │   employees    │
                  ├────────────────┤
                  │ id (PK)        │
                  │ employee_id    │
                  │ full_name      │
                  │ unit_id (FK)   │
                  │ department_id  │
                  │ role_id (FK)  │
                  └────────────────┘
```

**Benefício do modelo N:M:**
- ✅ Um usuário pode ter permissão em múltiplas unidades
- ✅ Um usuário pode estar em múltiplos departamentos
- ✅ Um usuário pode ter múltiplos cargos/funções
- ✅ Rastreia quem e quando atribuiu cada relacionamento

## 3. Exemplo de Registro Real no Banco

**Tabela users:**
```json
{
  "id": 1,
  "email": "admin@example.com",
  "password_hash": "$2b$10$cxhzBbJ8YE7c5eKpM9w5teJvXvN6x8Q2z5R4lM2nU9oP1q3sT7d4i",
  "name": "João Silva",
  "employee_id": 1,
  "api_key": null,
  "is_active": true,
  "last_login": "2026-01-21T10:33:04.000Z",
  "created_by": null,
  "updated_by": null,
  "valid_until": "2027-01-21T10:33:04.000Z",
  "term_accepted_at": "2026-01-21T10:33:04.000Z",
  "created_at": "2026-01-21T09:00:00.000Z",
  "updated_at": "2026-01-21T10:33:04.000Z"
}
```

**Tabela user_units (Relacionamento N:M):**
```json
[
  {
    "user_id": 1,
    "unit_id": 1,
    "assigned_at": "2026-01-21T09:00:00.000Z",
    "assigned_by": null
  },
  {
    "user_id": 1,
    "unit_id": 2,
    "assigned_at": "2026-01-21T14:00:00.000Z",
    "assigned_by": 1
  }
]
```

**Tabela user_departments (Relacionamento N:M):**
```json
[
  {
    "user_id": 1,
    "dept_id": 1,
    "assigned_at": "2026-01-21T09:00:00.000Z",
    "assigned_by": null
  }
]
```

**Tabela user_roles (Relacionamento N:M):**
```json
[
  {
    "user_id": 1,
    "role_id": 1,
    "assigned_at": "2026-01-21T09:00:00.000Z",
    "assigned_by": null
  }
]
```

## 4. JWT Token (Payload após autenticação)

Quando o usuário faz login, um JWT token é gerado com os dados essenciais:

```
┌───────────────────────────────────────────────────────────────────┐
│                    JWT TOKEN PAYLOAD                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  {                                                                 │
│    "sub": 1,                    ← ID do usuário (subject)        │
│    "email": "admin@example.com", ← Email para referência         │
│    "name": "João Silva",         ← Nome do usuário               │
│    "id": 1,                      ← ID (duplicado com sub)        │
│    "employeeId": 1,              ← ID do funcionário             │
│    "isActive": true,             ← Usuário ativo?               │
│    "termAcceptedAt": "2026-01...\", ← Aceitou termos?            │
│    "validUntil": "2027-01-...\",    ← Válido até quando?        │
│    "iat": 1705835704,            ← Emitido em (timestamp)     │
│    "exp": 1705839304             ← Expira em (timestamp)       │
│  }                                                               │
│                                                                  │
│  ℹ️  Unidades, Departamentos e Roles são carregados              │
│      sob demanda via endpoints específicos                       │
│                                                                  │
│  ⏱️  Duração: 1 hora (3600 segundos)                            │
│                                                                  │
└───────────────────────────────────────────────────────────────────┘
```

**Para obter unidades, departamentos e roles do usuário:**
```bash
GET /users/:id/units       # Retorna todas as unidades do usuário
GET /users/:id/departments # Retorna todos os departamentos
GET /users/:id/roles       # Retorna todos os cargos
```

## 5. Fluxo de Autenticação

```
┌──────────────────────────────────────────────────────────────────┐
│                   FLUXO DE LOGIN                                 │
└──────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────┐
                    │   Cliente/Frontend      │
                    └──────────┬──────────────┘
                               │
                               │ 1. POST /auth/login
                               │    {
                               │      "email": "admin@example.com",
                               │      "password": "admin123"
                               │    }
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Backend (NestJS)      │
                    │   AuthController        │
                    └──────────┬──────────────┘
                               │
                               │ 2. Busca usuário por email
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   AuthService           │
                    │   - Busca em DB         │
                    │   - Valida senha        │
                    │   - Gera JWT            │
                    └──────────┬──────────────┘
                               │
                               │ 3. Verifica senha
                               │    bcrypt.compare(password, hash)
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Banco de Dados        │
                    │   SELECT * FROM users   │
                    │   WHERE email = '...'   │
                    └──────────┬──────────────┘
                               │
                               │ 4. Retorna usuário com dados
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   JWT Service           │
                    │   jwtService.sign({     │
                    │     sub: user.id,       │
                    │     ...dados user...    │
                    │   })                    │
                    └──────────┬──────────────┘
                               │
                               │ 5. Retorna JWT + dados
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Cliente/Frontend      │
                    │                         │
                    │   {                     │
                    │     "access_token":     │
                    │       "eyJhbG..."       │
                    │     "sub": 1,           │
                    │     "email": "...",     │
                    │     ...outros dados...  │
                    │   }                     │
                    │                         │
                    │   💾 Armazena token     │
                    │      em localStorage   │
                    └─────────────────────────┘
```

## 6. Como o Usuário é Extraído do JWT

```
┌──────────────────────────────────────────────────────────────────┐
│              EXTRAÇÃO DE USUÁRIO DO JWT                          │
└──────────────────────────────────────────────────────────────────┘

   Cliente envia request com JWT
            │
            ▼
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
            │
            ▼
   ┌─────────────────────────────────────────┐
   │  Backend recebe request                 │
   │  JwtAuthGuard.canActivate()             │
   └──────────────┬──────────────────────────┘
                  │
                  │ Extrai token do header
                  │
                  ▼
   ┌─────────────────────────────────────────┐
   │  JWT Decode & Validate                  │
   │  jwtService.verify(token)               │
   └──────────────┬──────────────────────────┘
                  │
                  │ Se válido, retorna payload
                  │
                  ▼
   ┌─────────────────────────────────────────┐
   │  @GetUser() user: UserSession           │
   │                                         │
   │  user = {                               │
   │    sub: 1,                              │
   │    email: "admin@example.com",          │
   │    name: "João Silva",                  │
   │    unitId: 1,                           │
   │    departmentId: 1,                     │
   │    roleId: 1,                           │
   │    ...                                  │
   │  }                                      │
   └──────────────┬──────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────────────┐
   │  Controller recebe user com contexto    │
   │  e passa para service layer             │
   │                                         │
   │  this.service.create(dto, user.id)      │
   │                        └─ Audit trail!  │
   └─────────────────────────────────────────┘
```

## 7. Entidade em TypeScript (Interface)

**UserSession (no JWT):**
```typescript
interface UserSession {
  sub: number;                    // ID do usuário
  email: string;                  // Email
  name: string;                   // Nome
  id: number;                     // ID (duplicado)
  employeeId: number;             // ID do funcionário
  isActive: boolean;              // Usuário ativo?
  termAcceptedAt: string | null;  // Quando aceitou os termos
  validUntil: string | null;      // Válido até quando
  iat: number;                    // Emitido em (Unix timestamp)
  exp: number;                    // Expira em (Unix timestamp)
}
```

**UserWithRelations (Quando busca usuário com relacionamentos):**
```typescript
interface UserWithRelations extends UserSession {
  units: Array<{                  // Múltiplas unidades
    id: number;
    name: string;
    type: string;
    city: string;
    state: string;
    assignedAt: string;
    assignedBy: number | null;
  }>;
  departments: Array<{            // Múltiplos departamentos
    id: number;
    name: string;
    assignedAt: string;
    assignedBy: number | null;
  }>;
  roles: Array<{                  // Múltiplos cargos
    id: number;
    name: string;
    isTechnician: boolean;
    assignedAt: string;
    assignedBy: number | null;
  }>;
}
```

## 8. Exemplo de Uso em Controller

**Criar unidade (com tracking de quem criou):**
```typescript
@Post('units')
@UseGuards(JwtAuthGuard)        // Verifica JWT
@ApiBearerAuth()
async create(
  @GetUser() user: UserSession,  // Extrai usuário do JWT
  @Body() createUnitDto: CreateUnitDto
) {
  console.log(`Usuário ${user.name} criando unit`);
  
  // Passa userId para service
  return this.unitsService.create(createUnitDto, user.id);
}

// Service recebe userId
async create(dto: CreateUnitDto, userId: number): Promise<UnitDto> {
  const data = {
    name: dto.name,
    type: dto.type,
    city: dto.city,
    state: dto.state,
    created_by: userId,    // 👈 Audit trail automático!
    updated_by: userId,
  };
  
  return await this.supabaseService.insert('units', data);
}
```

**Atribuir unidade a usuário (N:M):**
```typescript
@Post('users/:userId/assign-unit/:unitId')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async assignUnitToUser(
  @GetUser() user: UserSession,
  @Param('userId') userId: number,
  @Param('unitId') unitId: number
) {
  // Insere na tabela user_units
  return this.usersService.assignUnit(
    userId,
    unitId,
    user.id  // Quem está fazendo a atribuição
  );
}

// Service
async assignUnit(userId: number, unitId: number, assignedBy: number) {
  const data = {
    user_id: userId,
    unit_id: unitId,
    assigned_at: new Date(),
    assigned_by: assignedBy,  // Rastreia quem atribuiu
  };
  
  return await this.supabaseService.insert('user_units', data);
}
```

**Obter unidades do usuário:**
```typescript
@Get('users/:id/units')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async getUserUnits(@Param('id') userId: number) {
  // JOIN com user_units e units
  return this.usersService.getUnits(userId);
}
```

## 9. Diagrama Completo de Segurança

```
┌────────────────────────────────────────────────────────────────┐
│                  SEGURANÇA E AUTENTICAÇÃO                      │
└────────────────────────────────────────────────────────────────┘

CAMADA 1: CREDENCIAIS (Frontend → Backend)
┌──────────────────────────────────────────┐
│ POST /auth/login                         │
│ {                                        │
│   "email": "admin@example.com",          │
│   "password": "admin123"                 │
│ }                                        │
│                                          │
│ ⚠️  Sempre usar HTTPS em produção       │
└──────────────────────────────────────────┘
              │
              ▼
CAMADA 2: VALIDAÇÃO (Backend)
┌──────────────────────────────────────────┐
│ 1. Busca usuário por email               │
│ 2. Compara senha com hash (bcrypt)       │
│ 3. Se válido, gera JWT                   │
│ 4. Senha NUNCA é retornada               │
└──────────────────────────────────────────┘
              │
              ▼
CAMADA 3: TOKEN (Backend → Frontend)
┌──────────────────────────────────────────┐
│ Retorna JWT com 15 campos de contexto    │
│ {                                        │
│   "access_token": "eyJhbG...",           │
│   "sub": 1,                              │
│   "email": "admin@example.com",          │
│   ...                                    │
│ }                                        │
│                                          │
│ ⏱️  Validade: 1 hora                     │
│ 🔑 Assinado com chave secreta            │
└──────────────────────────────────────────┘
              │
              ▼
CAMADA 4: ARMAZENAMENTO (Frontend)
┌──────────────────────────────────────────┐
│ localStorage.setItem('token', token)     │
│                                          │
│ ⚠️  Vulnerável a XSS                    │
│ ✅ Melhor: httpOnly cookies              │
└──────────────────────────────────────────┘
              │
              ▼
CAMADA 5: ENVIO (Frontend → Backend)
┌──────────────────────────────────────────┐
│ GET /units                               │
│ Authorization: Bearer eyJhbG...          │
│                                          │
│ ⚠️  Sempre usar HTTPS                   │
└──────────────────────────────────────────┘
              │
              ▼
CAMADA 6: VALIDAÇÃO (Backend)
┌──────────────────────────────────────────┐
│ JwtAuthGuard:                            │
│ 1. Extrai token do header                │
│ 2. Valida assinatura (chave secreta)     │
│ 3. Verifica expiração                    │
│ 4. Retorna payload (UserSession)         │
│                                          │
│ Se inválido: 401 Unauthorized            │
└──────────────────────────────────────────┘
              │
              ▼
CAMADA 7: AUTORIZAÇÃO (Backend)
┌──────────────────────────────────────────┐
│ @GetUser() user: UserSession             │
│                                          │
│ Agora temos acesso a:                   │
│ - user.id → Audit trail (created_by)    │
│ - user.roleId → Verificar permissões    │
│ - user.unitId → Filtrar dados da unit   │
│ - user.isTechnician → Lógica específica │
└──────────────────────────────────────────┘
```

## 10. Estado do Usuário Através do Tempo

```
┌──────────────────────────────────────────────────────────────────┐
│              CICLO DE VIDA DO USUÁRIO                            │
└──────────────────────────────────────────────────────────────────┘

CRIAÇÃO (Registration ou Admin)
  │
  ├─ id: gerado automaticamente
  ├─ email: único, validado
  ├─ password_hash: bcrypt de senha segura
  ├─ name: nome completo
  ├─ unit_id: atribuída
  ├─ department_id: atribuída
  ├─ role_id: atribuída
  ├─ is_active: true
  ├─ created_at: NOW()
  ├─ updated_at: NOW()
  ├─ created_by: ID de quem criou (se por admin)
  └─ last_login: NULL (ainda não logou)
     │
     ▼
PRIMEIRO LOGIN
  │
  ├─ JWT gerado com 15 campos
  ├─ last_login: atualizado para NOW()
  ├─ updated_at: atualizado
  └─ Token válido por 1 hora
     │
     ▼
OPERAÇÕES (Criar/Editar/Deletar dados)
  │
  ├─ created_by: rastreado automaticamente
  ├─ updated_by: rastreado automaticamente
  ├─ Audit trail criado em audit_logs
  └─ Todas as ações têm rastreabilidade
     │
     ▼
LOGOUT (ou expiração do token)
  │
  ├─ Token invalida
  ├─ Usuário volta a precisar fazer login
  ├─ Novo JWT gerado no próximo login
  └─ last_login: atualizado novamente
     │
     ▼
INATIVAÇÃO (se necessário)
  │
  ├─ is_active: false
  ├─ Usuário não consegue mais fazer login
  ├─ Registros não são deletados
  └─ Auditoria permanece intacta
     │
     ▼
DELEÇÃO (raramente)
  │
  ├─ Registra em audit_logs antes de deletar
  ├─ Deleta todas as referências (cascade)
  └─ Dados removidos permanentemente
```

## 11. Queries SQL com N:M

**Ver todas as unidades de um usuário:**
```sql
SELECT 
  u.name as usuario,
  un.name as unidade,
  un.type,
  uu.assigned_at,
  assigner.name as assigned_by
FROM public.users u
JOIN public.user_units uu ON u.id = uu.user_id
JOIN public.units un ON uu.unit_id = un.id
LEFT JOIN public.users assigner ON uu.assigned_by = assigner.id
WHERE u.id = 1
ORDER BY uu.assigned_at DESC;
```

**Ver todos os departamentos de um usuário:**
```sql
SELECT 
  u.name as usuario,
  dep.name as departamento,
  ud.assigned_at,
  assigner.name as assigned_by
FROM public.users u
JOIN public.user_departments ud ON u.id = ud.user_id
JOIN public.departments dep ON ud.dept_id = dep.id
LEFT JOIN public.users assigner ON ud.assigned_by = assigner.id
WHERE u.id = 1
ORDER BY ud.assigned_at DESC;
```

**Ver todos os cargos de um usuário:**
```sql
SELECT 
  u.name as usuario,
  r.name as cargo,
  r.description,
  r.is_technician,
  ur.assigned_at,
  assigner.name as assigned_by
FROM public.users u
JOIN public.user_roles ur ON u.id = ur.user_id
JOIN public.roles r ON ur.role_id = r.id
LEFT JOIN public.users assigner ON ur.assigned_by = assigner.id
WHERE u.id = 1
ORDER BY ur.assigned_at DESC;
```

**Ver todas as atribuições feitas por um usuário (auditoria completa):**
```sql
SELECT 
  'Unit Assignment' as tipo,
  assigner.name as quem_atribuiu,
  u.name as usuario,
  un.name as recurso,
  uu.assigned_at as quando
FROM public.user_units uu
JOIN public.users u ON uu.user_id = u.id
JOIN public.units un ON uu.unit_id = un.id
JOIN public.users assigner ON uu.assigned_by = assigner.id
WHERE uu.assigned_by = 1

UNION ALL

SELECT 
  'Department Assignment',
  assigner.name,
  u.name,
  dep.name,
  ud.assigned_at
FROM public.user_departments ud
JOIN public.users u ON ud.user_id = u.id
JOIN public.departments dep ON ud.dept_id = dep.id
JOIN public.users assigner ON ud.assigned_by = assigner.id
WHERE ud.assigned_by = 1

ORDER BY quando DESC;
```

**Ver usuários ativos com termos aceitos:**
```sql
SELECT 
  id,
  email,
  name,
  is_active,
  term_accepted_at,
  valid_until,
  CASE 
    WHEN valid_until IS NULL THEN 'Sem expiração'
    WHEN valid_until > NOW() THEN 'Válido'
    ELSE 'Expirado'
  END as status_validade
FROM public.users
WHERE is_active = true
AND term_accepted_at IS NOT NULL
ORDER BY created_at DESC;
```

---

## 📝 Resumo da Nova Arquitetura

A **entidade de usuário** é central no sistema:

✅ **Armazena**: Credenciais, dados de auditoria, termos aceitos, validade
✅ **Autentica**: Via email/senha, gera JWT com dados essenciais
✅ **Flexível**: Um usuário pode ter múltiplas unidades, departamentos e roles
✅ **Rastreia**: Quem criou, modificou, e quando atribuiu cada relacionamento
✅ **Segura**: Senha hasizada, JWT assinado, token com expiração, valid_until

**Mudanças principais:**
- ❌ Removido: unit_id, department_id, role_id (eram campos únicos)
- ✅ Adicionado: updated_by, valid_until, term_accepted_at
- ✅ Adicionado: 3 tabelas de junção (N:M) para flexibilidade

**JWT agora é leve:**
- Apenas dados essenciais do usuário
- Relacionamentos carregados sob demanda via endpoints
- Melhor performance

**Relacionamentos N:M permitem:**
- Um usuário em múltiplas unidades simultaneamente
- Um usuário em múltiplos departamentos
- Um usuário com múltiplos cargos/permissões
- Auditoria completa de quem atribuiu o quê e quando

**Exemplos de uso:**
```
João Silva é:
  ├─ Engineer em Headquarters
  ├─ Manager em Branch Office
  ├─ Admin em Regional Center
  └─ Em Administration + Engineering + Support
```
