# Supabase Integration - Setup Guide

**Status:** ✅ COMPLETE
**Date:** January 2026
**Database:** PostgreSQL (managed by Supabase)

---

## What Changed

The SIPAS backend now uses **Supabase** for data persistence instead of in-memory storage.

### Key Improvements:
- ✅ Real PostgreSQL database (managed)
- ✅ Automatic backups and disaster recovery
- ✅ Scalable to millions of users
- ✅ Built-in authentication support (optional)
- ✅ Real-time subscriptions ready
- ✅ Row-level security (RLS) support

---

## Getting Started with Supabase

### Step 1: Create a Supabase Account

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up with your email or GitHub
3. Create a new project
4. Choose a region closest to your users

### Step 2: Get Your API Keys

1. In Supabase Dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL** - Your `SUPABASE_URL`
   - **Anon Public Key** - Your `SUPABASE_KEY`
   - **Service Role Key** - Keep this secret (backend only)

### Step 3: Configure Environment Variables

Update `.env` with your Supabase credentials:

```dotenv
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key-here
```

### Step 4: Create Database Tables

1. Go to Supabase Dashboard → **SQL Editor**
2. Create a new query
3. Copy and paste the SQL from `db/migrations/001_initial_schema.sql`
4. Click **Run**

The script will create:
- `units` - Organizational units
- `departments` - Departments
- `roles` - User roles
- `employees` - Employee records
- `users` - User accounts with credentials
- `audit_logs` - Audit trail

### Step 5: Insert Sample Data

The migration script includes sample data (headquarters, departments, roles, employees).

To add your first user, run in SQL Editor:

```sql
INSERT INTO public.users (
  email,
  password_hash,
  name,
  unit_id,
  department_id,
  role_id
)
VALUES (
  'admin@example.com',
  'password123', -- In production, use bcrypt hashed password
  'Admin User',
  1, -- Headquarters unit
  1, -- Administration department
  1  -- Administrator role
);
```

### Step 6: Test the Connection

```bash
npm run start:dev
```

Your application should now:
- Connect to Supabase
- Load users from database
- Persist user data
- Handle authentication

---

## API Endpoints

### Authentication

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "roleName": "Administrator",
    "unitName": "headquarters",
    "unitId": 1
  }
}
```

### Users

#### Get All Users
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <your-token>"
```

#### Get User by ID
```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer <your-token>"
```

#### Create User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User"
  }'
```

#### Update User
```bash
curl -X PATCH http://localhost:3000/users/1 \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updated@example.com",
    "name": "Updated Name"
  }'
```

#### Delete User
```bash
curl -X DELETE http://localhost:3000/users/1 \
  -H "Authorization: Bearer <your-token>"
```

---

## Database Schema

### Tables

#### `units` - Organizational Units
```sql
CREATE TABLE units (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  is_armored BOOLEAN DEFAULT FALSE,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `users` - User Accounts
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  employee_id BIGINT REFERENCES employees(id),
  unit_id BIGINT NOT NULL REFERENCES units(id),
  department_id BIGINT NOT NULL REFERENCES departments(id),
  role_id BIGINT REFERENCES roles(id),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `audit_logs` - Audit Trail
```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Files Created/Modified

### New Files
- `src/database/supabase.module.ts` - Supabase module
- `src/database/supabase.service.ts` - Supabase client service
- `db/migrations/001_initial_schema.sql` - Database migration
- `.env.example` - Environment template

### Modified Files
- `.env` - Added Supabase credentials
- `src/users/users.service.ts` - Uses Supabase instead of in-memory
- `src/auth/auth.service.ts` - Uses Supabase for user lookup
- `src/users/users.module.ts` - Added SupabaseModule
- `src/auth/auth.module.ts` - Added SupabaseModule
- `src/app.module.ts` - SupabaseModule available to all services

---

## SupabaseService Methods

```typescript
// Select from table
async select(table: string, columns?: string, filters?: Record<string, any>)

// Insert into table
async insert(table: string, data: any)

// Update table
async update(table: string, data: any, filters: Record<string, any>)

// Delete from table
async delete(table: string, filters: Record<string, any>)

// Count records
async count(table: string, filters?: Record<string, any>)

// Execute RPC function
async rpc(functionName: string, params?: Record<string, any>)

// Get raw Supabase client
getClient(): SupabaseClient
```

---

## Usage Examples

### In a Service

```typescript
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class MyService {
  constructor(private supabase: SupabaseService) {}

  async findUsersByUnit(unitId: number) {
    const users = await this.supabase.select(
      'users',
      'id, email, name',
      { unit_id: unitId }
    );
    return users;
  }

  async createAuditLog(userId: number, action: string, resource: string) {
    await this.supabase.insert('audit_logs', {
      user_id: userId,
      action,
      resource,
      created_at: new Date(),
    });
  }
}
```

---

## Security Best Practices

### 1. Password Hashing
Always hash passwords before storing:

```typescript
import * as bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
await this.supabase.insert('users', {
  email,
  password_hash: hashedPassword,
  name,
  ...
});
```

### 2. Environment Variables
- **SUPABASE_URL** - Safe to expose (public)
- **SUPABASE_KEY** - Safe for browser (public key only)
- **SUPABASE_SERVICE_ROLE_KEY** - Keep secret! (backend only)

### 3. Row-Level Security (RLS)
Enable RLS on sensitive tables:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid()::bigint = id);
```

### 4. API Key Rotation
Regularly rotate Supabase keys in dashboard:
- Settings > API > Regenerate Keys

---

## Troubleshooting

### Error: "SUPABASE_URL and SUPABASE_KEY required"
- Check `.env` file has correct values
- Restart application
- Verify keys from Supabase dashboard

### Error: "Table does not exist"
- Run migration SQL in Supabase SQL Editor
- Verify table names match (case-sensitive)
- Check database in correct project

### Error: "Unauthorized"
- Verify SUPABASE_KEY is correct (should start with `eyJ...`)
- Check user has access to table via RLS policies
- Try with Service Role Key for admin operations

### Slow queries
- Add indexes to frequently filtered columns
- Use `.select()` to limit columns
- Optimize RLS policies
- Consider caching with Redis

---

## Next Steps

1. ✅ Create Supabase account
2. ✅ Get API credentials
3. ✅ Run database migration
4. ✅ Update `.env` with credentials
5. ✅ Test endpoints
6. Deploy to production

---

## Production Checklist

- [ ] Change default admin password
- [ ] Enable Row-Level Security (RLS)
- [ ] Set up regular backups
- [ ] Configure SSL/TLS
- [ ] Use Service Role Key for admin operations only
- [ ] Implement rate limiting
- [ ] Set up monitoring/alerts
- [ ] Document data retention policies
- [ ] Plan for disaster recovery
- [ ] Audit all database access

---

**Need Help?**
- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Discord Community: [https://discord.supabase.com](https://discord.supabase.com)
- API Reference: [https://supabase.com/docs/reference](https://supabase.com/docs/reference)
