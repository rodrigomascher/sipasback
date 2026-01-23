import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

describe('DepartmentsController (CRUD with Custom Methods)', () => {
  let controller: DepartmentsController;
  let service: DepartmentsService;

  const mockDepartmentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        {
          provide: DepartmentsService,
          useValue: mockDepartmentsService,
        },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get<DepartmentsService>(DepartmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    it('should return paginated departments', async () => {
      const mockDepartments = [
        { id: 1, name: 'Engineering', unitId: 1 },
        { id: 2, name: 'Sales', unitId: 1 },
      ];

      mockDepartmentsService.findAll.mockResolvedValue({
        data: mockDepartments,
        count: 2,
      });

      const result = await controller.findAll({ limit: 10, offset: 0 });

      expect(result.data).toEqual(mockDepartments);
    });

    it('should get department by id', async () => {
      const mockDepartment = { id: 1, name: 'Engineering', unitId: 1 };

      mockDepartmentsService.findOne.mockResolvedValue(mockDepartment);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockDepartment);
    });

    it('should create department', async () => {
      const createDto: CreateDepartmentDto = {
        name: 'HR',
        unitId: 1,
      };
      const mockResult = { id: 3, ...createDto };

      mockDepartmentsService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto, 1);

      expect(result).toEqual(mockResult);
    });

    it('should update department', async () => {
      const updateDto: UpdateDepartmentDto = { name: 'Human Resources' };
      const mockResult = {
        id: 1,
        name: 'Human Resources',
        unitId: 1,
      };

      mockDepartmentsService.update.mockResolvedValue(mockResult);

      const result = await controller.update(1, updateDto, 1);

      expect(result).toEqual(mockResult);
    });
  });
});
