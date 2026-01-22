import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { SupabaseService } from '../database/supabase.service';
import { CreateRoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/role.dto';

describe('RolesService (CRUD with Custom Methods)', () => {
  let service: RolesService;

  const mockSupabaseService = {
    select: jest.fn(),
    selectWithCount: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD - CREATE', () => {
    it('should successfully create a new role', async () => {
      const createDto: CreateRoleDto = { 
        name: 'Admin',
        description: 'Administrator role'
      };
      const mockResult = { 
        id: 1, 
        name: 'Admin',
        description: 'Administrator role',
        isTechnician: false,
        created_at: new Date(),
      };

      mockSupabaseService.insert.mockResolvedValue([mockResult]);

      const result = await service.create(createDto, 1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Admin');
      expect(mockSupabaseService.insert).toHaveBeenCalled();
    });
  });

  describe('CRUD - READ (findOne)', () => {
    it('should retrieve a role by id', async () => {
      const mockRole = { 
        id: 1, 
        name: 'Admin',
        description: 'Administrator role',
        isTechnician: false,
        created_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([mockRole]);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Admin');
    });
  });

  describe('CRUD - UPDATE', () => {
    it('should successfully update a role', async () => {
      const updateDto: UpdateRoleDto = { name: 'Administrator' };
      const updatedResult = { 
        id: 1, 
        name: 'Administrator',
        description: 'Administrator role',
        isTechnician: false,
        updated_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([{ id: 1 }]);
      mockSupabaseService.update.mockResolvedValue([updatedResult]);

      const result = await service.update(1, updateDto, 1);

      expect(result.name).toBe('Administrator');
    });
  });

  describe('CRUD - COUNT', () => {
    it('should return correct count of roles', async () => {
      mockSupabaseService.selectWithCount.mockResolvedValue({
        count: 3,
        data: [],
      });

      const result = await service.count();

      expect(result).toBe(3);
    });
  });

  describe('CUSTOM METHOD - findByTechnician', () => {
    it('should return roles marked as technician', async () => {
      const mockRoles = [
        { id: 2, name: 'Technician', isTechnician: true },
        { id: 3, name: 'Field Tech', isTechnician: true },
      ];

      mockSupabaseService.select.mockResolvedValue(mockRoles);

      const result = await service.findByTechnician(true);

      expect(result).toHaveLength(2);
      expect(result[0].isTechnician).toBe(true);
    });

    it('should return roles not marked as technician', async () => {
      const mockRoles = [
        { id: 1, name: 'Admin', isTechnician: false },
        { id: 4, name: 'Manager', isTechnician: false },
      ];

      mockSupabaseService.select.mockResolvedValue(mockRoles);

      const result = await service.findByTechnician(false);

      expect(result).toHaveLength(2);
      expect(result[0].isTechnician).toBe(false);
    });

    it('should return empty array when no roles match criteria', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.findByTechnician(true);

      expect(result).toEqual([]);
    });
  });
});
