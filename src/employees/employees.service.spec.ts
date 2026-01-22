import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { SupabaseService } from '../database/supabase.service';
import { CreateEmployeeDto } from './dto/employee.dto';
import { UpdateEmployeeDto } from './dto/employee.dto';

describe('EmployeesService (CRUD with Multiple Custom Methods)', () => {
  let service: EmployeesService;

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
        EmployeesService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD - CREATE', () => {
    it('should successfully create a new employee', async () => {
      const createDto: CreateEmployeeDto = {
        personId: 1,
        unitId: 1,
        departmentId: 1,
        roleId: 2,
      };
      const mockResult = {
        id: 1,
        personId: 1,
        unitId: 1,
        departmentId: 1,
        roleId: 2,
        created_at: new Date(),
      };

      mockSupabaseService.insert.mockResolvedValue([mockResult]);

      const result = await service.create(createDto, 1);

      expect(result.id).toBe(1);
      expect(result.unitId).toBe(1);
      expect(mockSupabaseService.insert).toHaveBeenCalled();
    });
  });

  describe('CRUD - READ (findOne)', () => {
    it('should retrieve an employee by id', async () => {
      const mockEmployee = {
        id: 1,
        personId: 1,
        unitId: 1,
        departmentId: 1,
        roleId: 2,
        created_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([mockEmployee]);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.unitId).toBe(1);
    });
  });

  describe('CRUD - UPDATE', () => {
    it('should successfully update an employee', async () => {
      const updateDto: UpdateEmployeeDto = { departmentId: 2 };
      const updatedResult = {
        id: 1,
        personId: 1,
        unitId: 1,
        departmentId: 2,
        roleId: 2,
        updated_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([{ id: 1 }]);
      mockSupabaseService.update.mockResolvedValue([updatedResult]);

      const result = await service.update(1, updateDto, 1);

      expect(result.departmentId).toBe(2);
    });
  });

  describe('CRUD - COUNT', () => {
    it('should return correct count of employees', async () => {
      mockSupabaseService.selectWithCount.mockResolvedValue({
        count: 5,
        data: [],
      });

      const result = await service.count();

      expect(result).toBe(5);
    });
  });

  describe('CUSTOM METHOD - findByUnitId', () => {
    it('should return employees from a specific unit', async () => {
      const mockEmployees = [
        { id: 1, unitId: 1, personId: 1 },
        { id: 2, unitId: 1, personId: 2 },
      ];

      mockSupabaseService.select.mockResolvedValue(mockEmployees);

      const result = await service.findByUnitId(1);

      expect(result).toHaveLength(2);
      expect(result[0].unitId).toBe(1);
    });

    it('should return empty array for unit with no employees', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.findByUnitId(999);

      expect(result).toEqual([]);
    });
  });

  describe('CUSTOM METHOD - findByDepartmentId', () => {
    it('should return employees from a specific department', async () => {
      const mockEmployees = [
        { id: 1, departmentId: 1, personId: 1 },
        { id: 3, departmentId: 1, personId: 3 },
      ];

      mockSupabaseService.select.mockResolvedValue(mockEmployees);

      const result = await service.findByDepartmentId(1);

      expect(result).toHaveLength(2);
      expect(result[0].departmentId).toBe(1);
    });

    it('should return empty array for department with no employees', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.findByDepartmentId(999);

      expect(result).toEqual([]);
    });
  });

  describe('CUSTOM METHOD - findByRoleId', () => {
    it('should return employees with a specific role', async () => {
      const mockEmployees = [
        { id: 1, roleId: 2, personId: 1 },
        { id: 4, roleId: 2, personId: 4 },
      ];

      mockSupabaseService.select.mockResolvedValue(mockEmployees);

      const result = await service.findByRoleId(2);

      expect(result).toHaveLength(2);
      expect(result[0].roleId).toBe(2);
    });

    it('should return empty array for role with no employees', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.findByRoleId(999);

      expect(result).toEqual([]);
    });
  });
});
