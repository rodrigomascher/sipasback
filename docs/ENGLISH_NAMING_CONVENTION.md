# SIPAS Backend - English Naming Convention

**Status:** ✅ All field names converted to English - Phase 2 Complete
**Date:** January 2025
**Version:** 2.0

---

## Overview

This document defines the standardized English naming convention for all field names, variables, and properties throughout the SIPAS NestJS backend. This follows Phase 2 of the project standardization effort, after the initial camelCase standardization (Phase 1).

---

## Core Principles

1. **English Only:** All field names, comments, and documentation in English for international team collaboration
2. **camelCase:** All identifiers use proper camelCase (first letter lowercase, subsequent words capitalized)
3. **Semantic Clarity:** Names clearly describe what the field represents
4. **Consistency:** Same concepts use same naming patterns across the entire codebase

---

## Field Naming Patterns

### ID Fields
Pattern: `<resource>Id` (lowercase "Id")

```typescript
userId              // User identifier
unitId              // Organizational unit identifier
departmentId        // Department identifier
roleId              // Role/Function identifier
employeeId          // Employee identifier
```

### Name/Text Fields
Pattern: `<resource>Name`

```typescript
name                // User's full name
unitName            // Name of organizational unit
departmentName      // Name of department
roleName            // Name of role/function
```

### Type/Category Fields
Pattern: `<resource>Type`

```typescript
unitType            // Type of unit (Main, Branch, etc.)
```

### Boolean/Flag Fields
Pattern: `is<Adjective>`

```typescript
isTechnician        // Is technical specialist
isArmoredUnit       // Is armored/protected unit
```

### Location Fields

```typescript
city                // City name
state               // State abbreviation (UF)
```

### Standard JWT Fields

```typescript
sub                 // Subject (user ID) - standard JWT claim
email               // User email address
iat                 // Issued at - Unix timestamp (standard JWT)
exp                 // Expiration - Unix timestamp (standard JWT)
```

---

## Complete Field Mapping

### Portuguese → English Translation Table

| Portuguese | English | Type | Purpose |
|-----------|---------|------|---------|
| `id` | `id` | number | Primary key/User ID |
| `nome` | `name` | string | User's full name |
| `email` | `email` | string | User email address |
| `idFuncionario` | `employeeId` | number | Employee ID (nullable) |
| `idUnidade` | `unitId` | number | Organization unit ID |
| `nomeUnidade` | `unitName` | string | Name of unit |
| `tipoUnidade` | `unitType` | string | Type of unit |
| `idSecretaria` | `departmentId` | number | Department ID |
| `nomeSecretaria` | `departmentName` | string | Name of department |
| `idFuncao` | `roleId` | number | Role/Function ID (nullable) |
| `nomeFuncao` | `roleName` | string | Name of role/function |
| `isTecnicoAS` | `isTechnician` | boolean | Is technical specialist |
| `isUnidadeBlindada` | `isArmoredUnit` | boolean | Is armored unit |
| `cidade` | `city` | string | City name |
| `uf` | `state` | string | State abbreviation |

---

## JWT Payload Structure (English)

```typescript
export interface JwtPayloadDto {
  // Standard JWT Claims
  sub: number;              // Subject (user ID)
  email: string;            // User email
  iat?: number;             // Issued at (automatic)
  exp?: number;             // Expiration (automatic)

  // User Identity
  name: string;             // User's full name
  employeeId?: number;      // Employee ID

  // Organization Structure
  unitId: number;           // Unit ID
  unitName: string;         // Unit name
  unitType: string;         // Unit type

  departmentId: number;     // Department ID
  departmentName: string;   // Department name

  roleId?: number;          // Role ID
  roleName: string;         // Role name

  // Classification
  isTechnician?: boolean;   // Is technical specialist
  isArmoredUnit?: boolean;  // Is armored unit

  // Location
  city: string;             // City
  state: string;            // State abbreviation
}
```

---

## Code Examples

### UserSession Interface (English)

```typescript
export interface UserSession {
  id: number;
  email: string;
  name: string;
  employeeId?: number | null;
  unitId: number;
  unitName: string;
  unitType: string;
  departmentId: number;
  departmentName: string;
  roleId?: number | null;
  roleName: string;
  isTechnician?: boolean;
  isArmoredUnit?: boolean;
  city: string;
  state: string;
}
```

### Login Response (English)

```typescript
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "John Smith",
    "roleName": "Administrator",
    "unitName": "headquarters",
    "unitId": 1
  }
}
```

### Example API Response (English)

```typescript
{
  "success": true,
  "message": "Session data obtained successfully",
  "data": {
    "userId": 1,
    "email": "admin@example.com",
    "name": "John Smith",
    "employeeId": 123,
    "unitId": 1,
    "unitName": "headquarters",
    "unitType": "Main",
    "departmentId": 1,
    "departmentName": "Administration",
    "roleId": 5,
    "roleName": "Administrator",
    "isTechnician": false,
    "isArmoredUnit": true,
    "city": "São Paulo",
    "state": "SP",
    "issuedAt": "2025-01-21T10:30:00.000Z",
    "expiresAt": "2025-01-21T11:30:00.000Z"
  }
}
```

---

## Logging Field Names (English)

### LogContext Interface

```typescript
export interface LogContext {
  userId?: number;          // User ID for audit trail
  email?: string;           // User email for audit trail
  action: string;           // Action being performed (e.g., LOGIN_SUCCESS, CREATE)
  module: string;           // Module name (auth, users, database, etc.)
  details?: Record<string, any>;  // Additional details
  timestamp?: Date;         // When the action occurred
  duration?: number;        // Duration in milliseconds
}
```

### LogLevel Enum

```typescript
enum LogLevel {
  DEBUG = 'DEBUG',          // Detailed diagnostic information
  INFO = 'INFO',            // General informational messages
  WARN = 'WARN',            // Warning messages
  ERROR = 'ERROR',          // Error messages
}
```

### Log Method Signatures

```typescript
// General structured logging
log(context: LogContext, level: LogLevel = LogLevel.INFO): void

// Error logging with stack trace
logError(context: LogContext, error: Error | string, stackTrace?: string): void

// HTTP request logging
logRequest(userId: number | undefined, method: string, path: string): void

// HTTP response logging with timing
logResponse(userId: number | undefined, method: string, path: string, statusCode: number, duration: number): void

// Authentication event logging
logAuth(email: string, success: boolean, details?: Record<string, any>): void

// Database operation logging
logDatabase(action: string, table: string, userId: number | undefined, details?: Record<string, any>): void

// Audit trail logging
logAudit(userId: number, action: string, resource: string, changes?: Record<string, any>): void
```

---

## Migration Reference

### Phase 1 (Completed)
- ✅ Standardized all field names to proper camelCase

### Phase 2 (Completed)
- ✅ Converted all Portuguese field names to English
- ✅ Updated all comments and documentation to English
- ✅ Implemented standardized logging system with 7 methods
- ✅ Integrated LoggerService throughout controllers
- ✅ Project compiles without errors

### Files Updated in Phase 2

**Core Authentication:**
- `src/auth/auth.service.ts` - UserSession interface + validateUser method
- `src/auth/auth.controller.ts` - Login/Register endpoints + logging integration
- `src/auth/dto/jwt-payload.dto.ts` - All field names converted
- `src/auth/dto/login.dto.ts` - Comments converted

**Logging System (NEW):**
- `src/common/logger/logger.service.ts` - Complete logging service
- `src/common/logger/logger.middleware.ts` - HTTP request/response logging
- `src/common/logger/logger.module.ts` - DI configuration

**Examples & Utilities:**
- `src/example/example.controller.ts` - All field names + descriptions converted
- `src/users/users.controller.ts` - API descriptions converted
- `src/users/dto/user.dto.ts` - DTO descriptions converted

**Application Configuration:**
- `src/app.module.ts` - Added LoggerModule to imports

---

## Best Practices

### 1. New Code
When writing new code, always use English field names following these patterns:
- `userId`, `unitName`, `isTechnician`, `departmentId`, etc.

### 2. Comments & Documentation
- Use English for all comments
- Use English for all JSDoc/documentation
- Use English for error messages

### 3. API Responses
- All JSON field names must be in English
- Use snake_case field names in API responses only if required by external APIs
- Document any field name transformations

### 4. Database Migration
When integrating with database:
- Map Portuguese column names to English property names
- Use TypeORM `@Column` decorators for mapping
- Document all column-to-property mappings

### 5. Logging
- Use LoggerService for all structured logging
- Provide meaningful context in LogContext
- Include relevant user/resource identifiers

---

## Verification Checklist

- ✅ All TypeScript interfaces use English names
- ✅ All DTO properties use English names
- ✅ All comments and descriptions in English
- ✅ All method names follow English naming conventions
- ✅ Logging system fully integrated
- ✅ Project compiles without errors
- ✅ Swagger documentation updated
- ✅ All unit tests use English names (as applicable)

---

## Additional Resources

- JWT Standard Claims: [RFC 7519](https://tools.ietf.org/html/rfc7519)
- NestJS Documentation: https://docs.nestjs.com
- TypeScript Naming Conventions: https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html

---

**Last Updated:** January 2025
**Maintained By:** Development Team
**Status:** Active
