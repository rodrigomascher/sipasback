import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../database/supabase.service';
import * as bcrypt from 'bcrypt';

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
  async validateUser(email: string, password: string): Promise<UserSession | null> {
    try {
      // Query user from Supabase
      const users = await this.supabaseService.select(
        'users',
        'id, email, name, password_hash, employee_id, unit_id, department_id, role_id, last_login, is_active',
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

      // Fetch related data separately
      let unitData = { name: 'Unknown Unit', type: 'Unknown', is_armored: false, city: 'Unknown', state: 'Unknown' };
      let departmentData = { name: 'Unknown Department' };
      let roleData = { name: 'User', is_technician: false };

      if (user.unit_id) {
        const units = await this.supabaseService.select('units', '*', { id: user.unit_id });
        if (units.length > 0) unitData = units[0];
      }

      if (user.department_id) {
        const depts = await this.supabaseService.select('departments', '*', { id: user.department_id });
        if (depts.length > 0) departmentData = depts[0];
      }

      if (user.role_id) {
        const roles = await this.supabaseService.select('roles', '*', { id: user.role_id });
        if (roles.length > 0) roleData = roles[0];
      }

      // Update last login
      await this.supabaseService.update(
        'users',
        { last_login: new Date().toISOString() },
        { id: user.id },
      );

      // Return UserSession with full data
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        employeeId: user.employee_id || null,
        unitId: user.unit_id,
        unitName: unitData.name,
        unitType: unitData.type,
        departmentId: user.department_id,
        departmentName: departmentData.name,
        roleId: user.role_id || null,
        roleName: roleData.name,
        isTechnician: roleData.is_technician || false,
        isArmoredUnit: unitData.is_armored || false,
        city: unitData.city,
        state: unitData.state,
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
