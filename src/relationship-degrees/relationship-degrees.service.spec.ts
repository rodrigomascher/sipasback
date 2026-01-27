import { Test, TestingModule } from '@nestjs/testing';
import { RelationshipDegreesService } from './relationship-degrees.service';
import { SupabaseService } from '../database/supabase.service';
import { CreateRelationshipDegreeDto } from './dto/create-relationship-degree.dto';
import { UpdateRelationshipDegreeDto } from './dto/update-relationship-degree.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('RelationshipDegreesService', () => {
  let service: RelationshipDegreesService;
  let supabaseService: SupabaseService;

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
        RelationshipDegreesService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<RelationshipDegreesService>(RelationshipDegreesService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a relationship degree', async () => {
      const createRelationshipDegreeDto: CreateRelationshipDegreeDto = {
        description: 'Mãe/Mãe social',
      };

      const mockResult = [
        {
          id: 1,
          description: 'Mãe/Mãe social',
          active: true,
          created_by: 5,
          updated_by: 5,
          created_at: new Date(),
          updated_at: null,
        },
      ];

      mockSupabaseService.insert.mockResolvedValue(mockResult);

      const result = await service.create(createRelationshipDegreeDto);

      expect(result.description).toBe('Mãe/Mãe social');
      expect(result.active).toBe(true);
    });

    it('should throw ConflictException if description already exists', async () => {
      const createRelationshipDegreeDto: CreateRelationshipDegreeDto = {
        description: 'Mãe/Mãe social',
      };

      mockSupabaseService.select.mockResolvedValue([{ id: 1 }]);

      await expect(service.create(createRelationshipDegreeDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated relationship degrees', async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            description: 'Mãe/Mãe social',
            active: true,
            created_at: new Date(),
          },
          {
            id: 2,
            description: 'Avó',
            active: true,
            created_at: new Date(),
          },
          {
            id: 3,
            description: 'Tia',
            active: true,
            created_at: new Date(),
          },
        ],
        count: 3,
      };

      mockSupabaseService.selectWithCount.mockResolvedValue(mockResult);

      const result = await service.findAll({ page: 1, pageSize: 10 });

      expect(result.data.length).toBe(3);
      expect(result.totalCount).toBe(3);
    });

    it('should filter by active status', async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            description: 'Mãe/Mãe social',
            active: true,
            created_at: new Date(),
          },
        ],
        count: 1,
      };

      mockSupabaseService.selectWithCount.mockResolvedValue(mockResult);

      const result = await service.findAll({ page: 1, pageSize: 10, active: true });

      expect(result.data.length).toBe(1);
      expect(result.data[0].active).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should find a relationship degree by ID', async () => {
      const mockResult = [
        {
          id: 1,
          description: 'Mãe/Mãe social',
          active: true,
          created_at: new Date(),
        },
      ];

      mockSupabaseService.select.mockResolvedValue(mockResult);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.description).toBe('Mãe/Mãe social');
    });

    it('should throw NotFoundException if not found', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update relationship degree', async () => {
      const updateRelationshipDegreeDto: UpdateRelationshipDegreeDto = {
        description: 'Mãe/Mãe social (Atualizado)',
      };

      const mockResult = [
        {
          id: 1,
          description: 'Mãe/Mãe social (Atualizado)',
          active: true,
          updated_at: new Date(),
        },
      ];

      mockSupabaseService.update.mockResolvedValue(mockResult);

      const result = await service.update(1, updateRelationshipDegreeDto);

      expect(result.description).toBe('Mãe/Mãe social (Atualizado)');
    });

    it('should deactivate relationship degree', async () => {
      const updateRelationshipDegreeDto: UpdateRelationshipDegreeDto = {
        active: false,
      };

      const mockResult = [
        {
          id: 1,
          description: 'Mãe/Mãe social',
          active: false,
          updated_at: new Date(),
        },
      ];

      mockSupabaseService.update.mockResolvedValue(mockResult);

      const result = await service.update(1, updateRelationshipDegreeDto);

      expect(result.active).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete relationship degree', async () => {
      mockSupabaseService.delete.mockResolvedValue([]);

      await service.delete(1);

      expect(mockSupabaseService.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not found', async () => {
      mockSupabaseService.delete.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
