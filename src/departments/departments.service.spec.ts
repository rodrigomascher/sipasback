import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { SupabaseService } from '../database/supabase.service';
import { CreateDepartmentDto } from './dto/department.dto';
import { UpdateDepartmentDto } from './dto/department.dto';

describe('DepartmentsService (CRUD with Custom Methods)', () => {
  let service: DepartmentsService;

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
        DepartmentsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD - CREATE', () => {
    it('should successfully create a new department', async () => {
      const createDto: CreateDepartmentDto = {
        name: 'Engineering',
        unitId: 1,
      };
      const mockResult = {
        id: 1,
        name: 'Engineering',
        unitId: 1,
        created_at: new Date(),
      };

      mockSupabaseService.insert.mockResolvedValue([mockResult]);

      const result = await service.create(createDto, 1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Engineering');
      expect(mockSupabaseService.insert).toHaveBeenCalled();
    });
  });

  describe('CRUD - READ (findOne)', () => {
    it('should retrieve a department by id', async () => {
      const mockDepartment = {
        id: 1,
        name: 'Engineering',
        unitId: 1,
        created_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([mockDepartment]);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Engineering');
    });
  });

  describe('CRUD - UPDATE', () => {
    it('should successfully update a department', async () => {
      const updateDto: UpdateDepartmentDto = { name: 'Engineering Team' };
      const updatedResult = {
        id: 1,
        name: 'Engineering Team',
        unitId: 1,
        updated_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([{ id: 1 }]);
      mockSupabaseService.update.mockResolvedValue([updatedResult]);

      const result = await service.update(1, updateDto, 1);

      expect(result.name).toBe('Engineering Team');
    });
  });

  describe('CRUD - COUNT', () => {
    it('should return correct count of departments', async () => {
      mockSupabaseService.selectWithCount.mockResolvedValue({
        count: 4,
        data: [],
      });

      const result = await service.count();

      expect(result).toBe(4);
    });
  });
});
