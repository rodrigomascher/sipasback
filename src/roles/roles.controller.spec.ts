import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { PaginationQueryBuilder } from '../common/builders/pagination-query.builder';

describe('RolesController (CRUD)', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findByTechnician: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated roles', async () => {
      const mockRoles = [
        { id: 1, name: 'Admin', isTechnician: false },
        { id: 2, name: 'Technician', isTechnician: true },
      ];

      mockRolesService.findAll.mockResolvedValue({
        data: mockRoles,
        count: 2,
        limit: 10,
        offset: 0,
      });

      const result = await controller.findAll({
        limit: 10,
        offset: 0,
      });

      expect(result.data).toEqual(mockRoles);
      expect(mockRolesService.findAll).toHaveBeenCalled();
    });

    it('should handle pagination parameters', async () => {
      mockRolesService.findAll.mockResolvedValue({
        data: [],
        count: 0,
        limit: 5,
        offset: 10,
      });

      const result = await controller.findAll({
        limit: 5,
        offset: 10,
      });

      expect(result.limit).toBe(5);
      expect(result.offset).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a single role by id', async () => {
      const mockRole = {
        id: 1,
        name: 'Admin',
        isTechnician: false,
      };

      mockRolesService.findOne.mockResolvedValue(mockRole);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockRole);
      expect(mockRolesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createDto: CreateRoleDto = {
        name: 'Manager',
        description: 'Manager role',
      };
      const mockResult = {
        id: 3,
        name: 'Manager',
        description: 'Manager role',
        isTechnician: false,
      };

      mockRolesService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockResult);
      expect(mockRolesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const updateDto: UpdateRoleDto = { name: 'Senior Manager' };
      const mockResult = {
        id: 1,
        name: 'Senior Manager',
        description: 'Senior Manager role',
        isTechnician: false,
      };

      mockRolesService.update.mockResolvedValue(mockResult);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockResult);
      expect(mockRolesService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('Custom Methods', () => {
    it('should find roles by technician flag', async () => {
      const mockRoles = [
        { id: 2, name: 'Technician', isTechnician: true },
        { id: 3, name: 'Field Tech', isTechnician: true },
      ];

      mockRolesService.findByTechnician.mockResolvedValue(mockRoles);

      const result = await controller.findByTechnician('true');

      expect(result).toEqual(mockRoles);
      expect(mockRolesService.findByTechnician).toHaveBeenCalledWith(true);
    });
  });
});
