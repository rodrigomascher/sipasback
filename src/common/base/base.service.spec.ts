import { Test, TestingModule } from '@nestjs/testing';
import { BaseService } from './base.service';
import { SupabaseService } from '../../database/supabase.service';
import { PaginationQueryDto } from '../dto/paginated-response.dto';
import { NotFoundException } from '@nestjs/common';

// Mock implementation of BaseService for testing
class TestableBaseService extends BaseService<any, any, any> {
  constructor(protected supabaseService: SupabaseService) {
    super();
    this.tableName = 'test_table';
    this.columns = ['id', 'name', 'description'];
  }

  mapData(data: any): any {
    return data;
  }

  transformForDb(data: any): any {
    return data;
  }
}

describe('BaseService', () => {
  let service: TestableBaseService;
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
        TestableBaseService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<TestableBaseService>(TestableBaseService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated list with default values', async () => {
      const mockData = [
        { id: 1, name: 'Test 1', description: 'Desc 1' },
        { id: 2, name: 'Test 2', description: 'Desc 2' },
      ];

      mockSupabaseService.selectWithCount.mockResolvedValue({
        data: mockData,
        count: 2,
      });

      const paginationQuery = new PaginationQueryDto({
        page: 1,
        pageSize: 10,
        sortBy: 'id',
        sortDirection: 'asc',
      });

      const result = await service.findAll(paginationQuery);

      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(mockSupabaseService.selectWithCount).toHaveBeenCalled();
    });

    it('should handle pagination with custom page and pageSize', async () => {
      const mockData = [{ id: 3, name: 'Test 3', description: 'Desc 3' }];

      mockSupabaseService.selectWithCount.mockResolvedValue({
        data: mockData,
        count: 100,
      });

      const paginationQuery = new PaginationQueryDto({
        page: 2,
        pageSize: 5,
        sortBy: 'name',
        sortDirection: 'desc',
      });

      const result = await service.findAll(paginationQuery);

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(5);
      expect(result.total).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should return a single record by id', async () => {
      const mockData = { id: 1, name: 'Test 1', description: 'Desc 1' };

      mockSupabaseService.select.mockResolvedValue([mockData]);

      const result = await service.findOne(1);

      expect(result).toEqual(mockData);
      expect(mockSupabaseService.select).toHaveBeenCalledWith(
        'test_table',
        ['id', 'name', 'description'],
        { id: 1 },
      );
    });

    it('should throw NotFoundException when record not found', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const createDto = { name: 'New Test', description: 'New Desc' };
      const mockResult = { id: 1, name: 'New Test', description: 'New Desc' };

      mockSupabaseService.insert.mockResolvedValue([mockResult]);

      const result = await service.create(createDto);

      expect(result).toEqual(mockResult);
      expect(mockSupabaseService.insert).toHaveBeenCalledWith(
        'test_table',
        expect.any(Object),
      );
    });

    it('should throw error when insert fails', async () => {
      const createDto = { name: 'New Test', description: 'New Desc' };

      mockSupabaseService.insert.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a record', async () => {
      const id = 1;
      const updateDto = { name: 'Updated', description: 'Updated Desc' };
      const mockResult = { id, ...updateDto };

      mockSupabaseService.select.mockResolvedValue([
        { id: 1, name: 'Test 1', description: 'Desc 1' },
      ]);

      mockSupabaseService.update.mockResolvedValue([mockResult]);

      const result = await service.update(id, updateDto);

      expect(result).toEqual(mockResult);
      expect(mockSupabaseService.update).toHaveBeenCalledWith(
        'test_table',
        expect.any(Object),
        { id: 1 },
      );
    });

    it('should throw NotFoundException when record to update not found', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a record', async () => {
      mockSupabaseService.select.mockResolvedValue([
        { id: 1, name: 'Test 1', description: 'Desc 1' },
      ]);

      mockSupabaseService.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockSupabaseService.delete).toHaveBeenCalledWith('test_table', {
        id: 1,
      });
    });

    it('should throw NotFoundException when record to delete not found', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('count', () => {
    it('should return total count of records', async () => {
      mockSupabaseService.selectWithCount.mockResolvedValue({
        count: 42,
        data: [],
      });

      const result = await service.count();

      expect(result).toBe(42);
    });
  });
});
