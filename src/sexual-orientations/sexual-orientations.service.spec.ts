import { Test, TestingModule } from '@nestjs/testing';
import { SexualOrientationsService } from './sexual-orientations.service';
import { SupabaseService } from '../database/supabase.service';
import { CreateSexualOrientationDto } from './dto/create-sexual-orientation.dto';
import { UpdateSexualOrientationDto } from './dto/update-sexual-orientation.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/paginated-response.dto';

describe('SexualOrientationsService', () => {
  let service: SexualOrientationsService;
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
        SexualOrientationsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<SexualOrientationsService>(SexualOrientationsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a sexual orientation', async () => {
      const createSexualOrientationDto: CreateSexualOrientationDto = {
        description: 'Heterossexual',
      };

      const mockResult = [
        {
          id: 1,
          description: 'Heterossexual',
          active: true,
          created_by: 5,
          updated_by: 5,
          created_at: new Date(),
          updated_at: null,
        },
      ];

      mockSupabaseService.insert.mockResolvedValue(mockResult);

      const result = await service.create(createSexualOrientationDto);

      expect(result.description).toBe('Heterossexual');
      expect(result.active).toBe(true);
    });

    it('should throw ConflictException if description already exists', async () => {
      const createSexualOrientationDto: CreateSexualOrientationDto = {
        description: 'Heterossexual',
      };

      mockSupabaseService.select.mockResolvedValue([{ id: 1 }]);

      await expect(service.create(createSexualOrientationDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated sexual orientations', async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            description: 'Heterossexual',
            active: true,
            created_at: new Date(),
          },
          {
            id: 2,
            description: 'Homossexual',
            active: true,
            created_at: new Date(),
          },
          {
            id: 3,
            description: 'Bissexual',
            active: true,
            created_at: new Date(),
          },
        ],
        count: 3,
      };

      mockSupabaseService.selectWithCount.mockResolvedValue(mockResult);

      const paginationQuery = new PaginationQueryDto({ page: 1, pageSize: 10 });
      const result = await service.findAll(paginationQuery);

      expect(result.data.length).toBe(3);
      expect(result.total).toBe(3);
    });

    it('should filter by active status', async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            description: 'Heterossexual',
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
    it('should find a sexual orientation by ID', async () => {
      const mockResult = [
        {
          id: 1,
          description: 'Heterossexual',
          active: true,
          created_at: new Date(),
        },
      ];

      mockSupabaseService.select.mockResolvedValue(mockResult);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.description).toBe('Heterossexual');
    });

    it('should throw NotFoundException if not found', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update sexual orientation', async () => {
      const updateSexualOrientationDto: UpdateSexualOrientationDto = {
        description: 'Heterossexual (Atualizado)',
      };

      const mockResult = [
        {
          id: 1,
          description: 'Heterossexual (Atualizado)',
          active: true,
          updated_at: new Date(),
        },
      ];

      mockSupabaseService.update.mockResolvedValue(mockResult);

      const result = await service.update(1, updateSexualOrientationDto);

      expect(result.description).toBe('Heterossexual (Atualizado)');
    });

    it('should deactivate sexual orientation', async () => {
      const updateSexualOrientationDto: UpdateSexualOrientationDto = {
        active: false,
      };

      const mockResult = [
        {
          id: 1,
          description: 'Heterossexual',
          active: false,
          updated_at: new Date(),
        },
      ];

      mockSupabaseService.update.mockResolvedValue(mockResult);

      const result = await service.update(1, updateSexualOrientationDto);

      expect(result.active).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete sexual orientation', async () => {
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
