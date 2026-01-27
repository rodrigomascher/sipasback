import { Test, TestingModule } from '@nestjs/testing';
import { GenderIdentitiesController } from './gender-identities.controller';
import { GenderIdentitiesService } from './gender-identities.service';
import { CreateGenderIdentityDto } from './dto/create-gender-identity.dto';
import { UpdateGenderIdentityDto } from './dto/update-gender-identity.dto';

describe('GenderIdentitiesController', () => {
  let controller: GenderIdentitiesController;
  let service: GenderIdentitiesService;

  const mockGenderIdentitiesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenderIdentitiesController],
      providers: [
        {
          provide: GenderIdentitiesService,
          useValue: mockGenderIdentitiesService,
        },
      ],
    }).compile();

    controller = module.get<GenderIdentitiesController>(GenderIdentitiesController);
    service = module.get<GenderIdentitiesService>(GenderIdentitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/gender-identities', () => {
    it('should create a new gender identity', async () => {
      const createGenderIdentityDto: CreateGenderIdentityDto = {
        description: 'Cisgênero',
      };

      const mockGenderIdentity = {
        id: 1,
        description: 'Cisgênero',
        active: true,
        createdAt: new Date(),
      };

      mockGenderIdentitiesService.create.mockResolvedValue(mockGenderIdentity);

      const result = await controller.create(createGenderIdentityDto);

      expect(result.description).toBe('Cisgênero');
      expect(mockGenderIdentitiesService.create).toHaveBeenCalledWith(
        createGenderIdentityDto,
      );
    });

    it('should create gender identity with active status', async () => {
      const createGenderIdentityDto: CreateGenderIdentityDto = {
        description: 'Transgênero',
      };

      const mockGenderIdentity = {
        id: 2,
        description: 'Transgênero',
        active: true,
        createdAt: new Date(),
      };

      mockGenderIdentitiesService.create.mockResolvedValue(mockGenderIdentity);

      const result = await controller.create(createGenderIdentityDto);

      expect(result.active).toBe(true);
    });
  });

  describe('GET /api/gender-identities', () => {
    it('should return paginated gender identities', async () => {
      const mockResponse = {
        data: [
          { id: 1, description: 'Cisgênero', active: true, createdAt: new Date() },
          { id: 2, description: 'Transgênero', active: true, createdAt: new Date() },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockGenderIdentitiesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10');

      expect(result.data.length).toBe(2);
      expect(result.totalCount).toBe(2);
    });

    it('should handle sorting', async () => {
      const mockResponse = {
        data: [
          { id: 1, description: 'Cisgênero', active: true },
          { id: 2, description: 'Transgênero', active: true },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockGenderIdentitiesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10', 'description', 'asc');

      expect(result.data.length).toBe(2);
    });
  });

  describe('GET /api/gender-identities/:id', () => {
    it('should return a specific gender identity', async () => {
      const mockGenderIdentity = {
        id: 1,
        description: 'Cisgênero',
        active: true,
        createdAt: new Date(),
      };

      mockGenderIdentitiesService.findOne.mockResolvedValue(mockGenderIdentity);

      const result = await controller.findOne(1);

      expect(result.description).toBe('Cisgênero');
      expect(mockGenderIdentitiesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('PATCH /api/gender-identities/:id', () => {
    it('should update a gender identity', async () => {
      const updateGenderIdentityDto: UpdateGenderIdentityDto = {
        description: 'Cisgênero (Atualizado)',
      };

      const mockUpdatedGenderIdentity = {
        id: 1,
        description: 'Cisgênero (Atualizado)',
        active: true,
        createdAt: new Date(),
      };

      mockGenderIdentitiesService.update.mockResolvedValue(
        mockUpdatedGenderIdentity,
      );

      const result = await controller.update(1, updateGenderIdentityDto);

      expect(result.description).toBe('Cisgênero (Atualizado)');
      expect(mockGenderIdentitiesService.update).toHaveBeenCalledWith(
        1,
        updateGenderIdentityDto,
      );
    });

    it('should deactivate gender identity', async () => {
      const updateGenderIdentityDto: UpdateGenderIdentityDto = {
        active: false,
      };

      const mockUpdatedGenderIdentity = {
        id: 1,
        description: 'Cisgênero',
        active: false,
        createdAt: new Date(),
      };

      mockGenderIdentitiesService.update.mockResolvedValue(
        mockUpdatedGenderIdentity,
      );

      const result = await controller.update(1, updateGenderIdentityDto);

      expect(result.active).toBe(false);
    });
  });

  describe('DELETE /api/gender-identities/:id', () => {
    it('should delete a gender identity', async () => {
      mockGenderIdentitiesService.delete.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(mockGenderIdentitiesService.delete).toHaveBeenCalledWith(1);
    });
  });
});
