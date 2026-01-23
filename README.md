# SIPAS Backend API

Sistema Integrado de Proteção e Acompanhamento Social (Integrated Social Protection and Monitoring System)

## 📦 Project Overview

A comprehensive NestJS backend for managing social assistance data with features for user management, person records, family relationships, and administrative units.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL database (via Supabase)

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start
```

### Access Documentation

API documentation is available at: **http://localhost:3000/api/docs**

## 📂 Project Structure

```
src/
├── common/
│   ├── base/                    # BaseService, BaseController
│   ├── decorators/              # @ApiCrudOperation
│   ├── filters/                 # GlobalExceptionFilter
│   ├── interceptors/            # Request/response interceptors
│   ├── types/                   # TypeScript interfaces
│   └── utils/
│       ├── related-entity-paginator.ts  # Pagination utility
│       └── transform.utils.ts           # Case transformation
│
├── database/                    # Supabase service
│
├── users/                       # User management
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── entities/
│   └── dto/
│
├── persons/                     # Person records
│   ├── persons.controller.ts
│   ├── persons.service.ts
│   ├── entities/
│   └── dto/
│
├── family-composition/          # Family relationships
│   ├── family-composition.controller.ts
│   ├── family-composition.service.ts
│   └── dto/
│
├── [other-modules]/            # Departments, Units, Roles, etc.
│
└── app.module.ts               # Root module
```

## 🔑 Key Features

### 1. User Management
- User account creation and updates
- CPF/NIS validation
- Unit assignment with pagination

**Endpoints:**
```
GET    /api/users                    # List all users
GET    /api/users/:id               # Get specific user
POST   /api/users                   # Create user
PUT    /api/users/:id               # Update user
DELETE /api/users/:id               # Delete user
GET    /api/user-units/:userId     # Get user's units (paginated)
```

### 2. Person Records
- Comprehensive person demographics
- CPF uniqueness validation
- Full-text search (name, CPF, NIS)
- Family relationship tracking

**Endpoints:**
```
GET    /api/persons                            # List all persons
GET    /api/persons/:id                        # Get specific person
POST   /api/persons                            # Create person
PUT    /api/persons/:id                        # Update person
DELETE /api/persons/:id                        # Delete person
GET    /api/persons/:id/family-members         # Get person's family (paginated)
GET    /api/persons/:id/with-family            # Person with family data
GET    /api/persons/search?q=name              # Search persons
```

### 3. Family Composition
- Family unit management
- Person-to-family relationships
- Relationship degree tracking
- Paginated member lists

**Endpoints:**
```
GET    /family-composition                     # List all records
GET    /family-composition/:id                 # Get record
POST   /family-composition                    # Create record
PUT    /family-composition/:id                 # Update record
DELETE /family-composition/:id                 # Delete record
GET    /family-composition/family/:id          # Get family members
GET    /family-composition/person/:id/paginated  # Get person's family (paginated)
GET    /family-composition/family/:id/paginated  # Get family members (paginated)
```

### 4. Supporting Entities
- Departments
- Units
- Roles
- Gender
- Gender Identity
- Sexual Orientation
- Relationship Degrees

## 🔄 Pagination Pattern

### Related Entity Pagination

For paginating arrays of related data (e.g., units per user, family members per person):

**Request Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10)
- `sortBy` - Field to sort by (optional)
- `sortDirection` - `asc` or `desc` (default: asc)

**Response Format:**
```json
{
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3
}
```

**Example Requests:**
```bash
# Get family members page 1, 10 items per page, sorted by name ascending
GET /api/persons/1/family-members?page=1&pageSize=10&sortBy=name&sortDirection=asc

# Get user units page 2, 20 items per page
GET /api/user-units/5?page=2&pageSize=20

# Get family members for person, sorted by creation date descending
GET /family-composition/person/1/paginated?sortBy=created_at&sortDirection=desc
```

## 🛡️ Error Handling

### Standard Error Response

```json
{
  "message": "User not found",
  "statusCode": 404,
  "timestamp": "2024-01-23T10:30:45.123Z"
}
```

### Validation Error Response

```json
{
  "message": ["firstName must not be empty", "cpf must be valid"],
  "statusCode": 400,
  "timestamp": "2024-01-23T10:30:45.123Z"
}
```

### Conflict Error (Duplicate CPF)

```json
{
  "message": "Person with CPF 12345678901 already exists",
  "statusCode": 409,
  "timestamp": "2024-01-23T10:30:45.123Z"
}
```

## 📝 Data Transfer Objects (DTOs)

All endpoints require proper DTOs with validation:

### CreatePersonDto
```typescript
{
  firstName: string       // @IsNotEmpty, @IsString
  lastName: string        // @IsNotEmpty, @IsString
  cpf?: string           // Optional, @IsNotEmpty if provided
  nis?: string           // Optional
  birthDate?: Date       // Optional
  genderId?: number      // Optional
  // ... other fields
}
```

### UpdatePersonDto
Same as CreatePersonDto but all fields optional.

## 🔐 Security Features

1. **Input Validation** - All DTOs use `class-validator`
2. **Error Handling** - GlobalExceptionFilter prevents sensitive info leakage
3. **CPF Validation** - Unique constraint on person CPF
4. **Row-level Security** - Supabase RLS policies
5. **Environment Variables** - Sensitive config not in code

## 📊 Database Schema

### Key Tables

**person**
- Primary demographics and documentation
- 60+ columns for comprehensive person data
- CPF as unique constraint

**users**
- Login and authentication
- Unit associations
- Role assignments

**family_composition**
- Person-to-family relationships
- Relationship degree tracking
- Person can belong to only one family

**units**
- Organizational units/departments
- Hierarchical structure support

## 🧪 Testing & Building

```bash
# Compile TypeScript to JavaScript
npm run build

# Run in development mode with hot reload
npm run start:dev

# Run in production mode
npm run start

# View Swagger documentation
open http://localhost:3000/api/docs
```

## 📚 API Documentation

### Swagger/OpenAPI

Full API documentation is auto-generated and available at:
```
http://localhost:3000/api/docs
```

Features:
- Request/response schemas with examples
- Parameter descriptions
- HTTP status codes
- Try-it-out functionality

### Architecture Overview

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Design patterns (BaseService, BaseController)
- Module organization
- Data flow
- Pagination strategy
- Performance considerations

## 🚀 Performance Optimizations

1. **Pagination** - Efficient handling of large datasets
2. **Selective Columns** - Only fetching required fields
3. **Client-side Pagination** - For related entity arrays
4. **Database Connection Pooling** - Via Supabase pgbouncer

## 🔄 Data Transformation

Automatic case conversion between API (camelCase) and database (snake_case):

**API Request:**
```json
{
  "firstName": "João",
  "lastName": "Silva"
}
```

**Database Storage:**
```sql
{ first_name: "João", last_name: "Silva" }
```

## 📋 Common Tasks

### Search Persons

```bash
curl -X GET "http://localhost:3000/api/persons/search?q=Jo%C3%A3o"
```

Response: Array of matching persons with ID, name, CPF, NIS, birthDate

### Get Family Members (Paginated)

```bash
curl -X GET "http://localhost:3000/api/persons/1/family-members?page=1&pageSize=10&sortBy=created_at&sortDirection=desc"
```

### Create Person with Validation

```bash
curl -X POST "http://localhost:3000/api/persons" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Maria",
    "lastName": "Santos",
    "cpf": "12345678901",
    "birthDate": "1990-05-15"
  }'
```

## 🆘 Troubleshooting

### Build Fails
1. Check Node.js version: `node --version` (should be 18+)
2. Clear cache: `npm cache clean --force && rm -rf node_modules`
3. Reinstall: `npm install`

### Database Connection Error
1. Verify .env variables: `SUPABASE_URL`, `SUPABASE_KEY`
2. Check Supabase project status
3. Verify network connectivity

### Port Already in Use
```bash
# Change port in .env
PORT=3001

# Or kill existing process on port 3000
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000
```

## 📖 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Supabase Documentation](https://supabase.com/docs)
- [class-validator](https://github.com/typestack/class-validator)
- [Swagger/OpenAPI](https://swagger.io)

## 📝 License

This project is proprietary. All rights reserved.

## 👥 Support

For issues or questions, please contact the development team.

---

**Last Updated:** January 2024
**API Version:** 1.0.0
