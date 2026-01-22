import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { BaseService } from '../common/base/base.service';
import { User } from '../common/types/database.types';
import { AuthService } from '../auth/auth.service';
import { UserUnitsService } from '../user-units/user-units.service';

export interface UserDto {
  id: number;
  email: string;
  name: string;
  isActive?: boolean;
  lastLogin?: Date;
  createdAt: Date;
  units?: any[];
}

export class CreateUserDto {
  email: string;
  password: string;
  name: string;
  unitIds?: number[];
}

export class UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  isActive?: boolean;
  unitIds?: number[];
}

@Injectable()
export class UsersService extends BaseService<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  protected tableName = 'users';
  protected columns = 'id, email, name, is_active, last_login, created_at';

  constructor(
    supabaseService: SupabaseService,
    private authService: AuthService,
    private userUnitsService: UserUnitsService,
  ) {
    super(supabaseService);
  }

  protected mapData(data: User): UserDto {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      isActive: data.is_active,
      lastLogin: data.last_login ? new Date(data.last_login) : undefined,
      createdAt: new Date(data.created_at),
    };
  }

  protected async transformForDb(dto: CreateUserDto | UpdateUserDto): Promise<any> {
    const transformed: any = { ...dto };
    if (transformed.password) {
      transformed.password_hash = await this.authService.hashPassword(transformed.password);
      delete transformed.password;
    }
    // Map isActive to is_active for database
    if ('isActive' in transformed) {
      transformed.is_active = transformed.isActive;
      delete transformed.isActive;
    }
    // Remove unitIds from database transform (handled separately)
    delete transformed.unitIds;
    return transformed;
  }

  /**
   * Find user by email - custom method
   */
  async findByEmail(email: string): Promise<UserDto | undefined> {
    const users = await this.supabaseService.select<User>(
      this.tableName,
      this.columns,
      { email },
    );
    if (users.length === 0) {
      return undefined;
    }
    return this.mapData(users[0]);
  }

  /**
   * Create user with units - wrapper around base create
   */
  async createWithUnits(dto: CreateUserDto, userId?: number): Promise<UserDto> {
    // Extract unitIds (transformForDb will remove it before saving to DB)
    const unitIds = dto.unitIds;

    // Create user (transformForDb will remove unitIds before saving to DB)
    const user = await super.create(dto, userId);

    // Then add units
    if (unitIds && unitIds.length > 0) {
      await this.userUnitsService.setUnitsForUser(user.id, unitIds);
    }

    // Fetch and return user with units
    return this.findOneWithUnits(user.id);
  }

  /**
   * Update user with units - wrapper around base update
   */
  async updateWithUnits(id: number, dto: UpdateUserDto, userId?: number): Promise<UserDto> {
    // Extract unitIds before update (transformForDb will remove it too)
    const unitIds = dto.unitIds;

    // Update user (transformForDb will remove unitIds before saving to DB)
    const user = await super.update(id, dto, userId);

    // Then update units if provided
    if (unitIds !== undefined) {
      await this.userUnitsService.setUnitsForUser(id, unitIds);
    }

    // Fetch and return user with units
    return this.findOneWithUnits(id);
  }

  /**
   * Find one user with their units
   */
  async findOneWithUnits(id: number): Promise<UserDto> {
    const users = await this.supabaseService.select<User>(
      this.tableName,
      this.columns,
      { id },
    );

    if (!users || users.length === 0) {
      throw new Error(`User with ID ${id} not found`);
    }

    const user = this.mapData(users[0]);
    user.units = await this.userUnitsService.getUnitsForUser(id);
    return user;
  }

  /**
   * Find all users with their units (overrides base findAll)
   */
  async findAllWithUnits(paginationQuery: any): Promise<any> {
    // Call base findAll to get paginated results
    const paginatedResult = await super.findAll(paginationQuery);
    
    // Fetch units for each user
    const dataWithUnits = await Promise.all(
      paginatedResult.data.map(async (user: any) => ({
        ...user,
        units: await this.userUnitsService.getUnitsForUser(user.id),
      }))
    );

    return {
      ...paginatedResult,
      data: dataWithUnits,
    };
  }
}

