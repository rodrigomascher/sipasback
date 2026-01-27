import { Test, TestingModule } from '@nestjs/testing';
import { SexualOrientationsController } from './sexual-orientations.controller';
import { SexualOrientationsService } from './sexual-orientations.service';
import { CreateSexualOrientationDto } from './dto/create-sexual-orientation.dto';
import { UpdateSexualOrientationDto } from './dto/update-sexual-orientation.dto';

describe('SexualOrientationsController', () => {
  let controller: SexualOrientationsController;
  let service: SexualOrientationsService;

  const mockSexualOrientationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SexualOrientationsController],
      providers: [
        {
          provide: SexualOrientationsService,
          useValue: mockSexualOrientationsService,
        },
      ],
    }).compile();

    controller = module.get<SexualOrientationsController>(
      SexualOrientationsController,
    );
    service = module.get<SexualOrientationsService>(SexualOrientationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/sexual-orientations', () => {
    it('should create a new sexual orientation', async () => {
      const createSexualOrientationDto: CreateSexualOrientationDto = {
        description: 'Heterossexual',
      };

      const mockSexualOrientation = {
        id: 1,
        description: 'Heterossexual',
        active: true,
        createdAt: new Date(),
      };

      mockSexualOrientationsService.create.mockResolvedValue(
        mockSexualOrientation,
      );

      const result = await controller.create(createSexualOrientationDto);

      expect(result.description).toBe('Heterossexual');
      expect(mockSexualOrientationsService.create).toHaveBeenCalledWith(
        createSexualOrientationDto,
      );
    });

    it('should create sexual orientation with active status', async () => {
      const createSexualOrientationDto: CreateSexualOrientationDto = {
        description: 'Homossexual',
      };

      const mockSexualOrientation = {
        id: 2,
        description: 'Homossexual',
        active: true,
        createdAt: new Date(),
      };

      mockSexualOrientationsService.create.mockResolvedValue(
        mockSexualOrientation,
      );

      const result = await controller.create(createSexualOrientationDto);

      expect(result.active).toBe(true);
    });
  });

  describe('GET /api/sexual-orientations', () => {
    it('should return paginated sexual orientations', async () => {
      const mockResponse = {
        data: [
          { id: 1, description: 'Heterossexual', active: true, createdAt: new Date() },
          { id: 2, description: 'Homossexual', active: true, createdAt: new Date() },
          { id: 3, description: 'Bissexual', active: true, createdAt: new Date() },
        ],
        totalCount: 3,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockSexualOrientationsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10');

      expect(result.data.length).toBe(3);
      expect(result.totalCount).toBe(3);
    });

    it('should handle sorting', async () => {
      const mockResponse = {
        data: [
          { id: 1, description: 'Heterossexual', active: true },
          { id: 2, description: 'Homossexual', active: true },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockSexualOrientationsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10', 'description', 'asc');

      expect(result.data.length).toBe(2);
    });
  });

  describe('GET /api/sexual-orientations/:id', () => {
    it('should return a specific sexual orientation', async () => {
      const mockSexualOrientation = {
        id: 1,
        description: 'Heterossexual',
        active: true,
        createdAt: new Date(),
      };

      mockSexualOrientationsService.findOne.mockResolvedValue(
        mockSexualOrientation,
      );

      const result = await controller.findOne(1);

      expect(result.description).toBe('Heterossexual');
      expect(mockSexualOrientationsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('PATCH /api/sexual-orientations/:id', () => {
    it('should update a sexual orientation', async () => {
      const updateSexualOrientationDto: UpdateSexualOrientationDto = {
        description: 'Heterossexual (Atualizado)',
      };

      const mockUpdatedSexualOrientation = {
        id: 1,
        description: 'Heterossexual (Atualizado)',
        active: true,
        createdAt: new Date(),
      };

      mockSexualOrientationsService.update.mockResolvedValue(
        mockUpdatedSexualOrientation,
      );

      const result = await controller.update(1, updateSexualOrientationDto);

      expect(result.description).toBe('Heterossexual (Atualizado)');
      expect(mockSexualOrientationsService.update).toHaveBeenCalledWith(
        1,
        updateSexualOrientationDto,
      );
    });

    it('should deactivate sexual orientation', async () => {
      const updateSexualOrientationDto: UpdateSexualOrientationDto = {
        active: false,
      };

      const mockUpdatedSexualOrientation = {
        id: 1,
        description: 'Heterossexual',
        active: false,
        createdAt: new Date(),
      };

      mockSexualOrientationsService.update.mockResolvedValue(
        mockUpdatedSexualOrientation,
      );

      const result = await controller.update(1, updateSexualOrientationDto);

      expect(result.active).toBe(false);
    });
  });

  describe('DELETE /api/sexual-orientations/:id', () => {
    it('should delete a sexual orientation', async () => {
      mockSexualOrientationsService.delete.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(mockSexualOrientationsService.delete).toHaveBeenCalledWith(1);
    });
  });
});
