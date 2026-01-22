import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { User } from '../common/types/database.types';

export interface UserDto {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.supabaseService.select<User>(
      'users',
      'id, email, name, created_at',
    );
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
    }));
  }

  async findOne(id: number): Promise<UserDto | undefined> {
    const users = await this.supabaseService.select<User>(
      'users',
      'id, email, name, created_at',
      { id },
    );
    if (users.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const user = users[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
    };
  }

  async findByEmail(email: string): Promise<UserDto | undefined> {
    const users = await this.supabaseService.select<User>(
      'users',
      'id, email, name, created_at',
      { email },
    );
    if (users.length === 0) {
      return undefined;
    }
    const user = users[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
    };
  }

  async create(email: string, name: string): Promise<UserDto> {
    const users = await this.supabaseService.insert<User>('users', {
      email,
      name,
      password_hash: '', // Will be set by auth service
      created_by: 0,
      updated_by: null,
    } as unknown as User);
    const user = users[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
    };
  }

  async update(id: number, email: string, name: string): Promise<UserDto> {
    const users = await this.supabaseService.update<User>(
      'users',
      { email, name } as unknown as Partial<User>,
      { id },
    );
    if (users.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const user = users[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
    };
  }

  async remove(id: number): Promise<boolean> {
    await this.supabaseService.delete('users', { id });
    return true;
  }
}
