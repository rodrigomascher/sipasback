# SIPAS Backend - Architecture Overview

## 📋 Project Structure

### Core Layers

```
src/
├── common/              # Shared utilities and base classes
│   ├── base/           # BaseService, BaseController
│   ├── decorators/     # Custom decorators (ApiCrudOperation)
│   ├── filters/        # GlobalExceptionFilter
│   ├── interceptors/   # Request/response interceptors
│   ├── utils/          # Utilities (transform, pagination)
│   └── types/          # TypeScript definitions
├── database/           # Supabase service and configuration
├── [module]/           # Feature modules (users, persons, etc.)
│   ├── controllers/    # HTTP request handlers
│   ├── services/       # Business logic
│   ├── entities/       # Data models
│   ├── dto/            # Data transfer objects
│   └── [module].module.ts
└── app.module.ts       # Root application module
```

### Modules

1. **Users Module** - User account management
   - UserUnitsService: Manage user unit assignments with pagination
   - UserDTO: Validation and serialization

2. **Persons Module** - Individual person records
   - PersonsService: CPF validation, family member pagination
   - Person entity: Demographics and personal information

3. **Family Composition Module** - Family relationship management
   - FamilyCompositionService: Family structure and relationships
   - Paginated member listing

4. **Supporting Modules**
   - Departments, Units, Roles, Gender, Gender Identity, Sexual Orientation, etc.

## 🔄 Design Patterns

### BaseService Pattern
All services extend `BaseService<Entity, CreateDTO, UpdateDTO>`:
- Standard CRUD operations (create, findAll, findOne, update, delete)
- Pagination support built-in
- Data transformation hooks (mapData, transformForDb)
- Database abstraction via SupabaseService

```typescript
// Example usage
async create(dto: CreatePersonDto): Promise<Person> {
  const transformed = this.transformForDb(dto);
  const result = await this.supabaseService.insert('person', transformed);
  return this.mapData(result);
}
```

### BaseController Pattern
All controllers extend `BaseController<Entity, CreateDTO, UpdateDTO>`:
- Standard REST endpoints (GET, POST, PUT, DELETE)
- Swagger documentation via @ApiCrudOperation decorator
- Custom route handlers for domain-specific logic

### Related Entity Pagination
For paginating relationships (e.g., units per user, family members per person):

```typescript
// Import pagination utilities
import { RelatedEntityPaginator, RelatedEntityPaginationOptions } from '../common/utils/related-entity-paginator';

// Use in service
async getPersonFamilyMembersPaginated(
  personId: number,
  paginationOptions?: RelatedEntityPaginationOptions,
): Promise<PaginatedRelatedEntities<any>> {
  const members = await this.fetchFamilyMembers(personId);
  return RelatedEntityPaginator.paginate(members, paginationOptions);
}

// Query from client
GET /api/persons/1/family-members?page=1&pageSize=10&sortBy=name&sortDirection=asc
```

## 🛡️ Error Handling

### GlobalExceptionFilter
Central exception handling with standardized error responses:
- HTTP exceptions: 400, 401, 403, 404, 409, 422, 429, 500
- Custom messages and status codes
- Validation errors with field details
- Database constraint violations

### Validation DTOs
All DTOs use `class-validator` decorators:
- @IsNotEmpty, @IsString, @MinLength, @MaxLength
- @IsEmail, @IsNumber, @IsBoolean
- @IsOptional, @IsArray
- Automatic validation in request handlers

## 📚 API Documentation

Swagger/OpenAPI documentation available at: `http://localhost:3000/api/docs`

### Swagger Features
- 12 API tags organized by module
- Request/response schemas with examples
- Parameter descriptions and validation rules
- HTTP status codes and error responses

## 🔑 Key Services

### PersonsService
Manages person records with advanced features:
- **create()** - Creates person with CPF uniqueness validation
- **update()** - Updates person with CPF conflict checking
- **search()** - Full-text search by name, CPF, or NIS
- **getPersonFamilyMembersPaginated()** - Paginated family members
- **getPersonWithFamilyMembersPaginated()** - Person with paginated family data

### FamilyCompositionService
Manages family relationships:
- **findByFamily()** - Get all members of a family
- **getFamilyMembersPaginated()** - Paginated members for a person
- **getFamilyPaginated()** - Paginated members for a family

### UserUnitsService
Manages user-unit relationships:
- **getUnitsForUser()** - Get all units assigned to a user
- **getUnitsForUserPaginated()** - Paginated unit list
- **addUnitToUser()** - Add unit assignment
- **removeUnitFromUser()** - Remove unit assignment
- **setUnitsForUser()** - Replace all unit assignments

## 📊 Database

### Supabase Integration
- Real-time database with PostgreSQL
- Row-level security policies
- Connection pooling via pgbouncer
- Environment-based configuration

### Key Tables
- person, users, units, departments, roles
- family_composition, gender, gender_identity
- sexual_orientation, relationship_degree

## 🔐 Security

- GlobalExceptionFilter prevents error details leaking
- Request validation at DTO level
- Database error handling with safe messages
- Environment variables for sensitive config

## 📈 Performance

### Pagination Strategy
- Client-side pagination for related entities (arrays)
- Server-side pagination for main table queries
- Configurable page size with defaults

### Query Optimization
- Select specific columns (not SELECT *)
- Filter at database level when possible
- Index support for common queries

## 🧪 Testing

### Build Verification
```bash
npm run build  # Compiles TypeScript to JavaScript
```

### Running Application
```bash
npm run start       # Production build
npm run start:dev   # Development with hot reload
```

## 📝 Coding Standards

### Naming Conventions
- Services: `EntityService` (e.g., PersonsService)
- Controllers: `EntityController` (e.g., PersonsController)
- DTOs: `CreateEntityDto`, `UpdateEntityDto`
- Entities: PascalCase class names

### JSDoc Comments
All public methods include JSDoc with:
- Description
- @param tags with types and descriptions
- @returns tag with return type
- @throws tag if method can throw

### Error Messages
- Clear, user-friendly error messages
- Specific error details (duplicate CPF, constraint violations, etc.)
- Proper HTTP status codes
- Validation errors list all field issues

## 🚀 Future Improvements

1. Add request/response logging middleware
2. Implement rate limiting per endpoint
3. Add comprehensive API tests
4. Database migration scripts
5. Performance metrics and monitoring
6. Audit logging for sensitive operations
