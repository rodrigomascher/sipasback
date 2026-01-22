import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { BaseService } from '../common/base/base.service';
import { toCamelCase } from '../common/utils/transform.utils';
import { User } from '../common/types/database.types';

export interface UserDto {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

export class CreateUserDto {
  email: string;
  name: string;
}

export class UpdateUserDto {
  email?: string;
  name?: string;
}

@Injectable()
export class UsersService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected tableName = 'users';
  protected columns = 'id, email, name, created_at';

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  protected mapData(data: User): UserDto {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      createdAt: new Date(data.created_at),
    };
  }

  protected transformForDb(dto: CreateUserDto | UpdateUserDto): any {
    return dto;
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
}
