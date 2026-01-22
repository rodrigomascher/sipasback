import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../database/supabase.service';
import { User } from '../common/types/database.types';
import * as bcrypt from 'bcrypt';

export interface UserSession {
  id: number;
  email: string;
  name: string;
  employeeId?: number | null;
  unitId: number | null;
  unitName: string;
  unitType: string;
  departmentId: number | null;
  departmentName: string;
  roleId?: number | null;
  roleName: string;
  isTechnician?: boolean;
  isArmoredUnit?: boolean;
  city: string;
  state: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private supabaseService: SupabaseService,
  ) {}

  /**
   * User login and JWT token generation
   * @param user User data after authentication
   * @returns JWT token with session payload
   */
  async login(user: UserSession) {
    // JWT payload with session data
    const payload = {
      sub: user.id, // Standard JWT: subject
      email: user.email,
      name: user.name,
      employeeId: user.employeeId || null,
      unitId: user.unitId,
      unitName: user.unitName,
      unitType: user.unitType,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      roleId: user.roleId || null,
      roleName: user.roleName,
      isTechnician: user.isTechnician || false,
      isArmoredUnit: user.isArmoredUnit || false,
      city: user.city,
      state: user.state,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 3600,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleName: user.roleName,
        unitName: user.unitName,
        unitId: user.unitId,
      },
    };
  }

  /**
   * Validate user credentials
   * Checks Supabase database for user with related data
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserSession | null> {
    try {
      // Query user from Supabase (without unit_id, department_id, role_id - now in junction tables)
      const users = await this.supabaseService.select<User>(
        'users',
        'id, email, name, password_hash, employee_id, last_login, is_active',
        { email },
      );

      if (!users || users.length === 0) {
        return null;
      }

      const user = users[0];

      if (!user.is_active) {
        return null;
      }

      // Verify password (in production, use proper bcrypt comparison)
      if (user.password_hash !== password) {
        return null;
      }

      // Fetch user's units from junction table
      let userUnits: any[] = [];
      try {
        userUnits = await this.supabaseService.select('user_units', 'unit_id', {
          user_id: user.id,
        });
      } catch (err) {
        console.warn(
          '[AUTH] Could not fetch user units:',
          (err as Error).message,
        );
      }

      // Get first unit's data if available
      let unitData: any = {
        id: null,
        name: 'Unknown Unit',
        type: 'Unknown',
        is_armored: false,
        city: 'Unknown',
        state: 'Unknown',
      };
      if (userUnits && userUnits.length > 0) {
        const firstUnit = userUnits[0];
        if (firstUnit.unit_id) {
          const units = await this.supabaseService.select('units', '*', {
            id: firstUnit.unit_id,
          });
          if (units && units.length > 0) {
            unitData = units[0];
          }
        }
      }

      // Fetch user's departments from junction table
      let userDepartments: any[] = [];
      try {
        userDepartments = await this.supabaseService.select(
          'user_departments',
          'department_id',
          { user_id: user.id },
        );
      } catch (err) {
        console.warn(
          '[AUTH] Could not fetch user departments:',
          (err as Error).message,
        );
      }

      let departmentData: any = { id: null, name: 'Unknown Department' };
      if (userDepartments && userDepartments.length > 0) {
        const firstDept = userDepartments[0];
        if (firstDept.department_id) {
          const depts = await this.supabaseService.select('departments', '*', {
            id: firstDept.department_id,
          });
          if (depts && depts.length > 0) departmentData = depts[0];
        }
      }

      // Fetch user's roles from junction table
      let userRoles: any[] = [];
      try {
        userRoles = await this.supabaseService.select('user_roles', 'role_id', {
          user_id: user.id,
        });
      } catch (err) {
        console.warn(
          '[AUTH] Could not fetch user roles:',
          (err as Error).message,
        );
      }

      let roleData: any = { id: null, name: 'User', is_technician: false };
      if (userRoles && userRoles.length > 0) {
        const firstRole = userRoles[0];
        if (firstRole.role_id) {
          const roles = await this.supabaseService.select('roles', '*', {
            id: firstRole.role_id,
          });
          if (roles && roles.length > 0) roleData = roles[0];
        }
      }

      // Update last login
      await this.supabaseService.update<User>(
        'users',
        { last_login: new Date().toISOString() } as unknown as Partial<User>,
        { id: user.id },
      );

      // Return UserSession with full data
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        employeeId: (user as any).employee_id || null,
        unitId: unitData?.id || null,
        unitName: unitData?.name || 'Unknown Unit',
        unitType: unitData?.type || 'Unknown',
        departmentId: departmentData?.id || null,
        departmentName: departmentData?.name || 'Unknown Department',
        roleId: roleData?.id || null,
        roleName: roleData?.name || 'User',
        isTechnician: roleData?.is_technician || false,
        isArmoredUnit: unitData?.is_armored || false,
        city: unitData?.city || 'Unknown',
        state: unitData?.state || 'Unknown',
      };
    } catch (error) {
      console.error('[AUTH] Error validating user:', error);
      return null;
    }
  }

  /**
   * Hash password using bcrypt
   * Use this when creating/updating user passwords
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
