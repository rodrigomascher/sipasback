import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(private supabaseService: SupabaseService) {}

  async seedAdminUser() {
    try {
      // Password: admin123
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Create admin user
      const userResult = await this.supabaseService.insert('users', {
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
      const deptResult = await this.supabaseService.insert('departments', {
        name: 'Administração',
        description: 'Departamento de Administração',
        is_active: true,
        created_by: userId,
      });

      // Create unit
      const unitResult = await this.supabaseService.insert('units', {
        name: 'Unidade Central',
        type: 'Sede',
        city: 'Brasília',
        state: 'DF',
        is_active: true,
        created_by: userId,
      });

      const unitId = unitResult[0].id;

      // Create role
      const roleResult = await this.supabaseService.insert('roles', {
        name: 'Administrador',
        description: 'Role de administrador do sistema',
        is_active: true,
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
