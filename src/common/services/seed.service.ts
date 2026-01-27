import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import * as bcrypt from 'bcrypt';

interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  is_active: boolean;
}

interface Department {
  id: number;
  description: string;
  created_by?: number;
}

interface Unit {
  id: number;
  name: string;
  type: string;
  city: string;
  state: string;
  created_by?: number;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  created_by?: number;
}

@Injectable()
export class SeedService {
  constructor(private supabaseService: SupabaseService) {}

  async seedAdminUser() {
    try {
      // Password: admin123
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Create admin user
      const userResult = await this.supabaseService.insert<User>('users', {
        email: 'admin@sipas.gov.br',
        name: 'Administrador',
        password_hash: hashedPassword,
        is_active: true,
      });

      if (!userResult || userResult.length === 0) {
        return { success: false, message: 'Failed to create admin user' };
      }

      const userId = userResult[0].id;

      // Create department
      const deptResult = await this.supabaseService.insert<Department>('departments', {
        description: 'Departamento de Administração',
        created_by: userId,
      });

      // Create unit
      const unitResult = await this.supabaseService.insert<Unit>('units', {
        name: 'Unidade Central',
        type: 'Sede',
        city: 'Brasília',
        state: 'DF',
        created_by: userId,
      });

      const unitId = unitResult[0].id;

      // Create role
      const roleResult = await this.supabaseService.insert<Role>('roles', {
        name: 'Administrador',
        description: 'Role de administrador do sistema',
        created_by: userId,
      });

      const roleId = roleResult[0].id;

      // Link user to unit
      await this.supabaseService.insert('user_units', {
        user_id: userId,
        unit_id: unitId,
      });

      // Link user to department
      const depId = deptResult[0].id;
      await this.supabaseService.insert('user_departments', {
        user_id: userId,
        department_id: depId,
      });

      // Link user to role
      await this.supabaseService.insert('user_roles', {
        user_id: userId,
        role_id: roleId,
      });

      return {
        success: true,
        message: 'Admin user created successfully',
        credentials: {
          email: 'admin@sipas.gov.br',
          password: 'admin123',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error creating admin user',
        error: (error as Error).message,
      };
    }
  }
}
