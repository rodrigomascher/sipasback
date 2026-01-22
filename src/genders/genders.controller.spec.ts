import { Test, TestingModule } from '@nestjs/testing';
import { GendersController } from './genders.controller';
import { GendersService } from './genders.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';
import { PaginationQueryDto } from '../common/dto/paginated-response.dto';

describe('GendersController', () => {
  let controller: GendersController;
  let service: GendersService;

  const mockGendersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GendersController],
      providers: [
        {
          provide: GendersService,
          useValue: mockGendersService,
        },
      ],
    }).compile();

    controller = module.get<GendersController>(GendersController);
    service = module.get<GendersService>(GendersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated genders list', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Masculino', created_at: new Date() },
          { id: 2, name: 'Feminino', created_at: new Date() },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      };

      mockGendersService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10', 'name', 'asc');

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockGendersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single gender by id', async () => {
      const mockGender = { id: 1, name: 'Masculino', created_at: new Date() };

      mockGendersService.findOne.mockResolvedValue(mockGender);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockGender);
      expect(mockGendersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new gender', async () => {
      const createGenderDto: CreateGenderDto = { name: 'Outro' };
      const mockResult = { id: 3, name: 'Outro', created_at: new Date() };

      mockGendersService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createGenderDto);

      expect(result).toEqual(mockResult);
      expect(mockGendersService.create).toHaveBeenCalledWith(createGenderDto);
    });
  });

  describe('update', () => {
    it('should update a gender', async () => {
      const updateGenderDto: UpdateGenderDto = { name: 'Masculino Atualizado' };
      const mockResult = { id: 1, name: 'Masculino Atualizado', created_at: new Date() };

      mockGendersService.update.mockResolvedValue(mockResult);

      const result = await controller.update('1', updateGenderDto);

      expect(result).toEqual(mockResult);
      expect(mockGendersService.update).toHaveBeenCalledWith(1, updateGenderDto);
    });
  });
});
