import { Test, TestingModule } from '@nestjs/testing';
import { GenderIdentitiesService } from './gender-identities.service';
import { SupabaseService } from '../database/supabase.service';
import { CreateGenderIdentityDto } from './dto/create-gender-identity.dto';
import { UpdateGenderIdentityDto } from './dto/update-gender-identity.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/paginated-response.dto';

describe('GenderIdentitiesService', () => {
  let service: GenderIdentitiesService;
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
        GenderIdentitiesService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<GenderIdentitiesService>(GenderIdentitiesService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a gender identity', async () => {
      const createGenderIdentityDto: CreateGenderIdentityDto = {
        description: 'Cisgênero',
      };

      const mockResult = [
        {
          id: 1,
          description: 'Cisgênero',
          active: true,
          created_by: 5,
          updated_by: 5,
          created_at: new Date(),
          updated_at: null,
        },
      ];

      mockSupabaseService.insert.mockResolvedValue(mockResult);

      const result = await service.create(createGenderIdentityDto);

      expect(result.description).toBe('Cisgênero');
      expect(result.active).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return paginated gender identities', async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            description: 'Cisgênero',
            active: true,
            created_at: new Date(),
          },
          {
            id: 2,
            description: 'Transgênero',
            active: true,
            created_at: new Date(),
          },
        ],
        count: 2,
      };

      mockSupabaseService.selectWithCount.mockResolvedValue(mockResult);

      const paginationQuery = new PaginationQueryDto({ page: 1, pageSize: 10 });
      const result = await service.findAll(paginationQuery);

      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should filter by active status', async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            description: 'Cisgênero',
            active: true,
            created_at: new Date(),
          },
        ],
        count: 1,
      };

      mockSupabaseService.selectWithCount.mockResolvedValue(mockResult);

      const paginationQuery = new PaginationQueryDto({ page: 1, pageSize: 10 });
      const result = await service.findAll(paginationQuery);

      expect(result.data.length).toBe(1);
      expect(result.data[0].active).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should find a gender identity by ID', async () => {
      const mockResult = [
        {
          id: 1,
          description: 'Cisgênero',
          active: true,
          created_at: new Date(),
        },
      ];

      mockSupabaseService.select.mockResolvedValue(mockResult);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.description).toBe('Cisgênero');
    });

    it('should throw NotFoundException if not found', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update gender identity', async () => {
      const updateGenderIdentityDto: UpdateGenderIdentityDto = {
        description: 'Cisgênero (Atualizado)',
      };

      const mockFindResult = [
        {
          id: 1,
          description: 'Cisgênero',
          active: true,
          updated_at: new Date(),
        },
      ];

      const mockResult = [
        {
          id: 1,
          description: 'Cisgênero (Atualizado)',
          active: true,
          updated_at: new Date(),
        },
      ];

      mockSupabaseService.select.mockResolvedValue(mockFindResult);
      mockSupabaseService.update.mockResolvedValue(mockResult);

      const result = await service.update(1, updateGenderIdentityDto);

      expect(result.description).toBe('Cisgênero (Atualizado)');
    });

    it('should preserve unchanged fields', async () => {
      const updateGenderIdentityDto: UpdateGenderIdentityDto = {
        active: false,
      };

      const mockFindResult = [
        {
          id: 1,
          description: 'Cisgênero',
          active: true,
          updated_at: new Date(),
        },
      ];

      const mockResult = [
        {
          id: 1,
          description: 'Cisgênero',
          active: false,
          updated_at: new Date(),
        },
      ];

      mockSupabaseService.select.mockResolvedValue(mockFindResult);
      mockSupabaseService.update.mockResolvedValue(mockResult);

      const result = await service.update(1, updateGenderIdentityDto);

      expect(result.description).toBe('Cisgênero');
      expect(result.active).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete gender identity', async () => {
      const mockFindResult = [{ id: 1, description: 'Cisgênero', active: true }];

      mockSupabaseService.select.mockResolvedValue(mockFindResult);
      mockSupabaseService.delete.mockResolvedValue([]);

      await service.delete(1);

      expect(mockSupabaseService.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not found', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
