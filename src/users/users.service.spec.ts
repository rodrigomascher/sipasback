import { Test, TestingModule } from '@nestjs/testing';
import { UsersService, CreateUserDto, UpdateUserDto, ChangePasswordDto } from './users.service';
import { SupabaseService } from '../database/supabase.service';
import { UserUnitsService } from '../user-units/user-units.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let supabaseService: SupabaseService;
  let userUnitsService: UserUnitsService;

  const mockSupabaseService = {
    from: jest.fn(),
    selectWithCount: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserUnitsService = {
    createUserUnits: jest.fn(),
    deleteUserUnits: jest.fn(),
    getUserUnits: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: UserUnitsService,
          useValue: mockUserUnitsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    userUnitsService = module.get<UserUnitsService>(UserUnitsService);
  });

  describe('create', () => {
    it('should create a user with valid email and password', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      const mockUser = {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
        isActive: true,
        createdAt: new Date(),
      };

      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      mockSupabaseService.insert.mockResolvedValue([mockUser]);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockSupabaseService.insert).toHaveBeenCalledWith('users', expect.objectContaining({
        email: 'user@example.com',
        name: 'John Doe',
      }));
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      jest.spyOn(service, 'findByEmail').mockResolvedValue({ id: 1, email: 'existing@example.com' } as any);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if password is too short', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        password: 'short',
        name: 'John Doe',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should create user with associated units', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        password: 'password123',
        name: 'John Doe',
        unitIds: [1, 2, 3],
      };

      const mockUser = {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
        isActive: true,
        createdAt: new Date(),
      };

      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      mockSupabaseService.insert.mockResolvedValue([mockUser]);
      mockUserUnitsService.createUserUnits.mockResolvedValue([
        { userId: 1, unitId: 1 },
        { userId: 1, unitId: 2 },
        { userId: 1, unitId: 3 },
      ]);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserUnitsService.createUserUnits).toHaveBeenCalledWith(1, [1, 2, 3]);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com', name: 'User 1', isActive: true, createdAt: new Date() },
        { id: 2, email: 'user2@example.com', name: 'User 2', isActive: true, createdAt: new Date() },
      ];

      mockSupabaseService.selectWithCount.mockResolvedValue({
        data: mockUsers,
        count: 2,
      });

      const result = await service.findAll({ page: 1, pageSize: 10 });

      expect(result).toEqual({
        data: mockUsers,
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
    });

    it('should filter users by search term', async () => {
      const mockUsers = [
        { id: 1, email: 'john@example.com', name: 'John Doe', isActive: true, createdAt: new Date() },
      ];

      mockSupabaseService.selectWithCount.mockResolvedValue({
        data: mockUsers,
        count: 1,
      });

      const result = await service.findAll({ page: 1, pageSize: 10, search: 'john' });

      expect(result.data).toEqual(mockUsers);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = { id: 1, email: 'user@example.com', name: 'User 1' };

      mockSupabaseService.select.mockResolvedValue([mockUser]);

      const result = await service.findByEmail('user@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user name and email', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
        name: 'Updated Name',
      };

      const mockUpdatedUser = {
        id: 1,
        email: 'newemail@example.com',
        name: 'Updated Name',
        isActive: true,
        createdAt: new Date(),
      };

      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      mockSupabaseService.update.mockResolvedValue([mockUpdatedUser]);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockSupabaseService.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockSupabaseService.update.mockResolvedValue([]);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };

      const mockUser = {
        id: 1,
        email: 'user@example.com',
        name: 'User 1',
        password: await bcrypt.hash('oldPassword123', 10),
      };

      jest.spyOn(service, 'findById').mockResolvedValue(mockUser as any);
      mockSupabaseService.update.mockResolvedValue([mockUser]);

      const result = await service.changePassword(1, changePasswordDto);

      expect(mockSupabaseService.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      };

      const mockUser = {
        id: 1,
        email: 'user@example.com',
        name: 'User 1',
        password: await bcrypt.hash('oldPassword123', 10),
      };

      jest.spyOn(service, 'findById').mockResolvedValue(mockUser as any);

      await expect(service.changePassword(1, changePasswordDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockSupabaseService.delete.mockResolvedValue([]);

      await service.delete(1);

      expect(mockSupabaseService.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockSupabaseService.delete.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      const mockDeactivatedUser = {
        id: 1,
        email: 'user@example.com',
        name: 'User 1',
        isActive: false,
      };

      mockSupabaseService.update.mockResolvedValue([mockDeactivatedUser]);

      const result = await service.deactivateUser(1);

      expect(result.isActive).toBe(false);
    });
  });

  describe('findAllWithUnits', () => {
    it('should find all users with their units', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          name: 'User 1',
          isActive: true,
          createdAt: new Date(),
        },
      ];

      mockSupabaseService.selectWithCount.mockResolvedValue({
        data: mockUsers,
        count: 1,
      });

      mockUserUnitsService.getUserUnits.mockResolvedValue([
        { userId: 1, unitId: 1 },
        { userId: 1, unitId: 2 },
      ]);

      const result = await service.findAllWithUnits({ page: 1, pageSize: 10 });

      expect(result.data).toBeDefined();
      expect(result.totalCount).toBe(1);
    });
  });
});
