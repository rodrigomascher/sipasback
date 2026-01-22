import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

describe('EmployeesController (CRUD with Custom Methods)', () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  const mockEmployeesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findByUnitId: jest.fn(),
    findByDepartmentId: jest.fn(),
    findByRoleId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    it('should return paginated employees', async () => {
      const mockEmployees = [
        { id: 1, personId: 1, unitId: 1, departmentId: 1, roleId: 2 },
        { id: 2, personId: 2, unitId: 1, departmentId: 2, roleId: 3 },
      ];

      mockEmployeesService.findAll.mockResolvedValue({
        data: mockEmployees,
        count: 2,
      });

      const result = await controller.findAll({ limit: 10, offset: 0 });

      expect(result.data).toEqual(mockEmployees);
    });

    it('should get employee by id', async () => {
      const mockEmployee = {
        id: 1,
        personId: 1,
        unitId: 1,
        departmentId: 1,
        roleId: 2,
      };

      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockEmployee);
    });

    it('should create employee', async () => {
      const createDto: CreateEmployeeDto = {
        personId: 3,
        unitId: 1,
        departmentId: 1,
        roleId: 2,
      };
      const mockResult = { id: 3, ...createDto };

      mockEmployeesService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto, 1);

      expect(result).toEqual(mockResult);
    });

    it('should update employee', async () => {
      const updateDto: UpdateEmployeeDto = { departmentId: 2 };
      const mockResult = {
        id: 1,
        personId: 1,
        unitId: 1,
        departmentId: 2,
        roleId: 2,
      };

      mockEmployeesService.update.mockResolvedValue(mockResult);

      const result = await controller.update(1, updateDto, 1);

      expect(result).toEqual(mockResult);
    });
  });

  describe('Custom Methods', () => {
    it('should find employees by unit', async () => {
      const mockEmployees = [
        { id: 1, unitId: 1, personId: 1 },
        { id: 2, unitId: 1, personId: 2 },
      ];

      mockEmployeesService.findByUnitId.mockResolvedValue(mockEmployees);

      const result = await controller.findByUnitId(1);

      expect(result).toEqual(mockEmployees);
      expect(mockEmployeesService.findByUnitId).toHaveBeenCalledWith(1);
    });

    it('should find employees by department', async () => {
      const mockEmployees = [
        { id: 1, departmentId: 1, personId: 1 },
      ];

      mockEmployeesService.findByDepartmentId.mockResolvedValue(mockEmployees);

      const result = await controller.findByDepartmentId(1);

      expect(result).toEqual(mockEmployees);
    });

    it('should find employees by role', async () => {
      const mockEmployees = [
        { id: 1, roleId: 2, personId: 1 },
        { id: 4, roleId: 2, personId: 4 },
      ];

      mockEmployeesService.findByRoleId.mockResolvedValue(mockEmployees);

      const result = await controller.findByRoleId(2);

      expect(result).toEqual(mockEmployees);
    });
  });
});
