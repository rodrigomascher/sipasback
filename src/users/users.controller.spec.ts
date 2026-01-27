import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService, CreateUserDto, UpdateUserDto, ChangePasswordDto } from './users.service';
import { HttpStatus } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    changePassword: jest.fn(),
    deactivateUser: jest.fn(),
    findAllWithUnits: jest.fn(),
    findOneWithUnits: jest.fn(),
    createWithUnits: jest.fn(),
    updateWithUnits: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      const mockUser = {
        id: 1,
        email: 'newuser@example.com',
        name: 'New User',
        isActive: true,
        createdAt: new Date(),
      };

      mockUsersService.createWithUnits.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto, { userId: 1 });

      expect(result).toEqual(mockUser);
      expect(mockUsersService.createWithUnits).toHaveBeenCalledWith(createUserDto, 1);
    });

    it('should create user with associated units', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        unitIds: [1, 2],
      };

      const mockUser = {
        id: 1,
        email: 'newuser@example.com',
        name: 'New User',
        isActive: true,
        createdAt: new Date(),
        units: [{ id: 1 }, { id: 2 }],
      };

      mockUsersService.createWithUnits.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto, { userId: 1 });

      expect(result).toEqual(mockUser);
      expect(result.units).toBeDefined();
    });
  });

  describe('GET /users', () => {
    it('should return paginated list of users', async () => {
      const mockResponse = {
        data: [
          { id: 1, email: 'user1@example.com', name: 'User 1', isActive: true, createdAt: new Date() },
          { id: 2, email: 'user2@example.com', name: 'User 2', isActive: true, createdAt: new Date() },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockUsersService.findAllWithUnits.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10', 'email', 'asc', '');

      expect(result).toEqual(mockResponse);
      expect(result.data.length).toBe(2);
    });

    it('should filter users by search term', async () => {
      const mockResponse = {
        data: [
          { id: 1, email: 'john@example.com', name: 'John Doe', isActive: true, createdAt: new Date() },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockUsersService.findAllWithUnits.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10', 'email', 'asc', 'john');

      expect(result.data.length).toBe(1);
      expect(result.data[0].email).toContain('john');
    });

    it('should handle pagination correctly', async () => {
      const mockResponse = {
        data: [],
        totalCount: 0,
        page: 5,
        pageSize: 10,
        totalPages: 0,
      };

      mockUsersService.findAllWithUnits.mockResolvedValue(mockResponse);

      const result = await controller.findAll('5', '10');

      expect(result.page).toBe(5);
      expect(result.pageSize).toBe(10);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a specific user', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        name: 'User 1',
        isActive: true,
        createdAt: new Date(),
      };

      mockUsersService.findOneWithUnits.mockResolvedValue(mockUser);

      const result = await controller.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOneWithUnits).toHaveBeenCalledWith(1);
    });

    it('should return user with associated units', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        name: 'User 1',
        isActive: true,
        createdAt: new Date(),
        units: [
          { id: 1, name: 'Unit 1' },
          { id: 2, name: 'Unit 2' },
        ],
      };

      mockUsersService.findOneWithUnits.mockResolvedValue(mockUser);

      const result = await controller.findById(1);

      expect(result.units).toBeDefined();
      expect(result.units.length).toBe(2);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        name: 'Updated User',
      };

      const mockUpdatedUser = {
        id: 1,
        email: 'updated@example.com',
        name: 'Updated User',
        isActive: true,
        createdAt: new Date(),
      };

      mockUsersService.updateWithUnits.mockResolvedValue(mockUpdatedUser);

      const result = await controller.update('1', updateUserDto, { userId: 1 });

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUsersService.updateWithUnits).toHaveBeenCalledWith(1, updateUserDto, 1);
    });

    it('should update only name field', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const mockUpdatedUser = {
        id: 1,
        email: 'user@example.com',
        name: 'Updated Name',
        isActive: true,
        createdAt: new Date(),
      };

      mockUsersService.updateWithUnits.mockResolvedValue(mockUpdatedUser);

      const result = await controller.update('1', updateUserDto, { userId: 1 });

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      mockUsersService.delete.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(mockUsersService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /users/:id/deactivate', () => {
    it('should deactivate a user', async () => {
      const mockDeactivatedUser = {
        id: 1,
        email: 'user@example.com',
        name: 'User 1',
        isActive: false,
        createdAt: new Date(),
      };

      mockUsersService.deactivateUser.mockResolvedValue(mockDeactivatedUser);

      const result = await controller.deactivateUser(1);

      expect(result.isActive).toBe(false);
      expect(mockUsersService.deactivateUser).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /users/:id/change-password', () => {
    it('should change user password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };

      mockUsersService.changePassword.mockResolvedValue(undefined);

      await controller.changePassword(1, changePasswordDto);

      expect(mockUsersService.changePassword).toHaveBeenCalledWith(1, changePasswordDto);
    });
  });
});
