import { Test, TestingModule } from '@nestjs/testing';
import { RelationshipDegreesController } from './relationship-degrees.controller';
import { RelationshipDegreesService } from './relationship-degrees.service';
import { CreateRelationshipDegreeDto } from './dto/create-relationship-degree.dto';
import { UpdateRelationshipDegreeDto } from './dto/update-relationship-degree.dto';

describe('RelationshipDegreesController', () => {
  let controller: RelationshipDegreesController;
  let service: RelationshipDegreesService;

  const mockRelationshipDegreesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RelationshipDegreesController],
      providers: [
        {
          provide: RelationshipDegreesService,
          useValue: mockRelationshipDegreesService,
        },
      ],
    }).compile();

    controller = module.get<RelationshipDegreesController>(
      RelationshipDegreesController,
    );
    service = module.get<RelationshipDegreesService>(RelationshipDegreesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/relationship-degrees', () => {
    it('should create a new relationship degree', async () => {
      const createRelationshipDegreeDto: CreateRelationshipDegreeDto = {
        description: 'Mãe/Mãe social',
      };

      const mockRelationshipDegree = {
        id: 1,
        description: 'Mãe/Mãe social',
        active: true,
        createdAt: new Date(),
      };

      mockRelationshipDegreesService.create.mockResolvedValue(
        mockRelationshipDegree,
      );

      const result = await controller.create(createRelationshipDegreeDto);

      expect(result.description).toBe('Mãe/Mãe social');
      expect(mockRelationshipDegreesService.create).toHaveBeenCalledWith(
        createRelationshipDegreeDto,
      );
    });

    it('should create relationship degree with active status', async () => {
      const createRelationshipDegreeDto: CreateRelationshipDegreeDto = {
        description: 'Avó',
      };

      const mockRelationshipDegree = {
        id: 2,
        description: 'Avó',
        active: true,
        createdAt: new Date(),
      };

      mockRelationshipDegreesService.create.mockResolvedValue(
        mockRelationshipDegree,
      );

      const result = await controller.create(createRelationshipDegreeDto);

      expect(result.active).toBe(true);
    });
  });

  describe('GET /api/relationship-degrees', () => {
    it('should return paginated relationship degrees', async () => {
      const mockResponse = {
        data: [
          { id: 1, description: 'Mãe/Mãe social', active: true, createdAt: new Date() },
          { id: 2, description: 'Avó', active: true, createdAt: new Date() },
          { id: 3, description: 'Tia', active: true, createdAt: new Date() },
        ],
        totalCount: 3,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockRelationshipDegreesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10');

      expect(result.data.length).toBe(3);
      expect(result.totalCount).toBe(3);
    });

    it('should handle sorting', async () => {
      const mockResponse = {
        data: [
          { id: 1, description: 'Avó', active: true },
          { id: 2, description: 'Mãe/Mãe social', active: true },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockRelationshipDegreesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10', 'description', 'asc');

      expect(result.data.length).toBe(2);
    });
  });

  describe('GET /api/relationship-degrees/:id', () => {
    it('should return a specific relationship degree', async () => {
      const mockRelationshipDegree = {
        id: 1,
        description: 'Mãe/Mãe social',
        active: true,
        createdAt: new Date(),
      };

      mockRelationshipDegreesService.findOne.mockResolvedValue(
        mockRelationshipDegree,
      );

      const result = await controller.findOne(1);

      expect(result.description).toBe('Mãe/Mãe social');
      expect(mockRelationshipDegreesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('PATCH /api/relationship-degrees/:id', () => {
    it('should update a relationship degree', async () => {
      const updateRelationshipDegreeDto: UpdateRelationshipDegreeDto = {
        description: 'Mãe/Mãe social (Atualizado)',
      };

      const mockUpdatedRelationshipDegree = {
        id: 1,
        description: 'Mãe/Mãe social (Atualizado)',
        active: true,
        createdAt: new Date(),
      };

      mockRelationshipDegreesService.update.mockResolvedValue(
        mockUpdatedRelationshipDegree,
      );

      const result = await controller.update(1, updateRelationshipDegreeDto);

      expect(result.description).toBe('Mãe/Mãe social (Atualizado)');
      expect(mockRelationshipDegreesService.update).toHaveBeenCalledWith(
        1,
        updateRelationshipDegreeDto,
      );
    });

    it('should deactivate relationship degree', async () => {
      const updateRelationshipDegreeDto: UpdateRelationshipDegreeDto = {
        active: false,
      };

      const mockUpdatedRelationshipDegree = {
        id: 1,
        description: 'Mãe/Mãe social',
        active: false,
        createdAt: new Date(),
      };

      mockRelationshipDegreesService.update.mockResolvedValue(
        mockUpdatedRelationshipDegree,
      );

      const result = await controller.update(1, updateRelationshipDegreeDto);

      expect(result.active).toBe(false);
    });
  });

  describe('DELETE /api/relationship-degrees/:id', () => {
    it('should delete a relationship degree', async () => {
      mockRelationshipDegreesService.delete.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(mockRelationshipDegreesService.delete).toHaveBeenCalledWith(1);
    });
  });
});
