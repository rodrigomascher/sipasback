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
  units?: Array<{
    id: number;
    name: string;
    type: string;
    city: string;
    state: string;
  }>;
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
        units: user.units || [],
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

      // Verify password using bcrypt
      const isPasswordValid = await this.comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
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

      // Get all units data for the user
      const allUnits: Array<{
        id: number;
        name: string;
        type: string;
        city: string;
        state: string;
      }> = [];

      if (userUnits && userUnits.length > 0) {
        for (const userUnit of userUnits) {
          if (userUnit.unit_id) {
            const units = await this.supabaseService.select('units', '*', {
              id: userUnit.unit_id,
            });
            if (units && units.length > 0) {
              const unit = units[0] as any;
              allUnits.push({
                id: unit.id,
                name: unit.name,
                type: unit.type,
                city: unit.city,
                state: unit.state,
              });
            }
          }
        }
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
        units: allUnits,
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

  /**
   * Decode JWT and get user info
   */
  getUserFromToken(token: string): any {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      });
      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        employeeId: decoded.employeeId || null,
        unitId: decoded.unitId,
        unitName: decoded.unitName,
        unitType: decoded.unitType,
        departmentId: decoded.departmentId,
        departmentName: decoded.departmentName,
        roleId: decoded.roleId || null,
        roleName: decoded.roleName,
        isTechnician: decoded.isTechnician || false,
        isArmoredUnit: decoded.isArmoredUnit || false,
        city: decoded.city,
        state: decoded.state,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Select unit and return new JWT token with unit in payload
   */
  async selectUnit(
    user: any,
    unitId: number,
  ): Promise<{ access_token: string; token_type: string; expires_in: number; user: any }> {
    // Verify user has access to this unit
    const userUnit = await this.supabaseService.select('user_units', '*', {
      user_id: user.id,
      unit_id: unitId,
    });

    if (!userUnit || userUnit.length === 0) {
      throw new Error('User does not have access to this unit');
    }

    // Buscar dados da unidade
    const units = await this.supabaseService.select('units', '*', {
      id: unitId,
    });

    if (!units || units.length === 0) {
      throw new Error('Unit not found');
    }

    const unit = units[0] as any;

    // Criar payload com a unidade selecionada
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      employeeId: user.employeeId || null,
      unitId: unit.id,
      unitName: unit.name,
      unitType: unit.type,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      roleId: user.roleId || null,
      roleName: user.roleName,
      isTechnician: user.isTechnician || false,
      isArmoredUnit: unit.is_armored || false,
      city: unit.city,
      state: unit.state,
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
        unitName: unit.name,
        unitId: unit.id,
        units: user.units || [],
      },
    };
  }
}
