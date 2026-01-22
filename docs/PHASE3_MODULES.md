# SIPAS Backend - Phase 3 Documentation

## Overview

Phase 3 implements comprehensive CRUD modules with mandatory JWT authentication and audit trail tracking across all resource tables.

## Database Migrations

### Migration 001: Initial Schema (`001_initial_schema.sql`)

Creates the initial database structure with 6 core tables:

1. **units** - Organizational units with audit fields (created_by, updated_by)
2. **departments** - Department information linked to units
3. **roles** - User roles/functions
4. **employees** - Employee records
5. **users** - User accounts with JWT session data
6. **audit_logs** - Audit trail tracking

Run this migration first in Supabase SQL Editor.

### Migration 002: Add Audit Trail (`002_add_audit_trail.sql`)

Adds audit tracking fields to all tables:

- `created_by` - BIGINT FK to users(id)
- `updated_by` - BIGINT FK to users(id)
- `reviewed_by` and `reviewed_at` - For audit_logs table

**Important:** Run this migration AFTER migration 001.

## Application Modules

### 1. Units Module

**Routes:**
- `GET /units` - List all units (authenticated)
- `GET /units/count` - Total unit count (authenticated)
- `GET /units/:id` - Get unit by ID (authenticated)
- `GET /units/search/city/:city` - Find by city (authenticated)
- `GET /units/search/state/:state` - Find by state (authenticated)
- `POST /units` - Create new unit (authenticated, requires JWT)
- `PATCH /units/:id` - Update unit (authenticated, requires JWT)
- `DELETE /units/:id` - Delete unit (authenticated, requires JWT)

**Files:**
- `src/units/dto/unit.dto.ts` - Data transfer objects
- `src/units/units.service.ts` - Business logic
- `src/units/units.controller.ts` - HTTP routes
- `src/units/units.module.ts` - Module definition

### 2. Departments Module

**Routes:**
- `GET /departments` - List all departments (authenticated)
- `GET /departments/count` - Total count (authenticated)
- `GET /departments/:id` - Get by ID (authenticated)
- `GET /departments/search/unit/:unitId` - Find by unit (authenticated)
- `POST /departments` - Create (authenticated)
- `PATCH /departments/:id` - Update (authenticated)
- `DELETE /departments/:id` - Delete (authenticated)

**Files:**
- `src/departments/dto/department.dto.ts`
- `src/departments/departments.service.ts`
- `src/departments/departments.controller.ts`
- `src/departments/departments.module.ts`

### 3. Roles Module

**Routes:**
- `GET /roles` - List all roles (authenticated)
- `GET /roles/count` - Total count (authenticated)
- `GET /roles/:id` - Get by ID (authenticated)
- `GET /roles/search/technician?isTechnician=true` - Filter by technician (authenticated)
- `POST /roles` - Create (authenticated)
- `PATCH /roles/:id` - Update (authenticated)
- `DELETE /roles/:id` - Delete (authenticated)

**Files:**
- `src/roles/dto/role.dto.ts`
- `src/roles/roles.service.ts`
- `src/roles/roles.controller.ts`
- `src/roles/roles.module.ts`

### 4. Employees Module

**Routes:**
- `GET /employees` - List all employees (authenticated)
- `GET /employees/count` - Total count (authenticated)
- `GET /employees/:id` - Get by ID (authenticated)
- `GET /employees/search/unit/:unitId` - Find by unit (authenticated)
- `GET /employees/search/department/:departmentId` - Find by department (authenticated)
- `GET /employees/search/role/:roleId` - Find by role (authenticated)
- `POST /employees` - Create (authenticated)
- `PATCH /employees/:id` - Update (authenticated)
- `DELETE /employees/:id` - Delete (authenticated)

**Files:**
- `src/employees/dto/employee.dto.ts`
- `src/employees/employees.service.ts`
- `src/employees/employees.controller.ts`
- `src/employees/employees.module.ts`

## Authentication

### Mandatory JWT Authentication

All GET endpoints now require JWT Bearer token in Authorization header:

```bash
curl -H "Authorization: Bearer <jwt_token>" http://localhost:3000/units
```

**Response for unauthorized requests:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Getting a JWT Token

1. Login with credentials:
```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

2. Response includes access token:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sub": 1,
  ...
}
```

3. Use token in subsequent requests

## Audit Trail Tracking

### How It Works

1. User authenticates via JWT
2. When creating/updating records, the userId is extracted from token
3. Service layer automatically sets `created_by` and `updated_by` fields
4. Database stores user reference for audit purposes

### Example Flow

```typescript
// Controller extracts user from JWT
@Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async create(@GetUser() user: UserSession, @Body() dto: CreateUnitDto) {
  // Passes user.id (userId) to service
  return this.unitsService.create(dto, user.id);
}

// Service receives userId and tracks who made the change
async create(createUnitDto: CreateUnitDto, userId: number): Promise<UnitDto> {
  const data = {
    name: createUnitDto.name,
    // ... other fields ...
    created_by: userId,    // Who created
    updated_by: userId,    // Who last modified
  };
  
  const result = await this.supabaseService.insert('units', data);
  return this.mapToUnitDto(result[0]);
}
```

### Audit Fields in Responses

All DTOs include:
- `createdBy: number | null` - User ID who created the record
- `updatedBy: number | null` - User ID who last modified
- `createdAt: string` - Creation timestamp
- `updatedAt: string` - Last modification timestamp

Example response:
```json
{
  "id": 1,
  "name": "Headquarters",
  "type": "Main",
  "isArmored": true,
  "city": "São Paulo",
  "state": "SP",
  "createdBy": 1,
  "updatedBy": 1,
  "createdAt": "2026-01-21T10:00:00Z",
  "updatedAt": "2026-01-21T10:30:00Z"
}
```

## Running Migrations

### Step 1: Initial Schema (001)

1. Open Supabase SQL Editor
2. Copy contents of `db/migrations/001_initial_schema.sql`
3. Paste and execute

### Step 2: Audit Trail (002)

1. Open Supabase SQL Editor
2. Copy contents of `db/migrations/002_add_audit_trail.sql`
3. Paste and execute

**Note:** Ensure migration 001 completes before running migration 002.

## API Documentation

Access Swagger UI at: `http://localhost:3000/docs`

All protected endpoints show 🔒 lock icon and have "Bearer Token" authorization scheme.

## Error Responses

### 401 Unauthorized (Missing or Invalid Token)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Unit with ID 999 not found"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "statusCode": 400,
  "message": [
    "name must be a string",
    "unitId must be a number"
  ],
  "error": "Bad Request"
}
```

## Security Best Practices

1. ✅ All data endpoints require JWT authentication
2. ✅ User actions tracked via created_by/updated_by
3. ✅ Database constraints prevent orphaned references
4. ✅ Indexes on audit columns for query performance
5. ✅ Environment variables for sensitive configuration

## Development

### Building the Project
```bash
npm run build
```

### Running in Development
```bash
npm run start:dev
```

### Running in Production
```bash
npm start
```

### Testing Endpoints

Use Swagger UI at `http://localhost:3000/docs` or cURL:

```bash
# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.access_token')

# Use token to access protected endpoints
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/units
```

## Next Steps

### Future Enhancements
- [ ] Role-based access control (RBAC) on data operations
- [ ] Soft deletes (deleted_at timestamp)
- [ ] Comprehensive audit log endpoints
- [ ] Pagination for large result sets
- [ ] Advanced filtering and sorting
- [ ] Database performance monitoring
