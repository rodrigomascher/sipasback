import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  let service: SupabaseService;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    // Mock environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_KEY = 'test-key-123';

    // Mock Supabase client methods
    mockSupabaseClient = {
      from: jest.fn(() => ({
        select: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      rpc: jest.fn(),
    };

    // Mock createClient
    jest.mock('@supabase/supabase-js', () => ({
      createClient: jest.fn(() => mockSupabaseClient),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [SupabaseService],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;

      expect(() => {
        // This should throw during service instantiation
        new SupabaseService();
      }).toThrow('SUPABASE_URL and SUPABASE_KEY environment variables are required');
    });

    it('should throw error if SUPABASE_KEY is missing', () => {
      delete process.env.SUPABASE_KEY;

      expect(() => {
        new SupabaseService();
      }).toThrow('SUPABASE_URL and SUPABASE_KEY environment variables are required');
    });

    it('should initialize with valid environment variables', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getClient', () => {
    it('should return the Supabase client instance', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
    });
  });

  describe('select', () => {
    it('should select all records without filters', async () => {
      const mockData = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ];

      const mockQuery = {
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.select('test_table');

      expect(result).toEqual(mockData);
    });

    it('should apply filters when selecting', async () => {
      const mockData = [{ id: 1, status: 'active' }];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.select('test_table', '*', { status: 'active' });

      expect(result).toEqual(mockData);
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should apply sorting when specified', async () => {
      const mockData = [{ id: 1, name: 'A' }];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.select('test_table', '*', {}, 'name', 'asc');

      expect(result).toEqual(mockData);
      expect(mockQuery.order).toHaveBeenCalled();
    });

    it('should convert camelCase sortBy to snake_case', async () => {
      const mockData = [{ id: 1 }];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      await service.select('test_table', '*', {}, 'createdAt', 'asc');

      expect(mockQuery.order).toHaveBeenCalledWith('created_at', {
        ascending: true,
      });
    });

    it('should apply pagination with limit and offset', async () => {
      const mockData = [{ id: 1 }];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.select('test_table', '*', {}, undefined, 'asc', 10, 0);

      expect(result).toEqual(mockData);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
    });

    it('should throw error on Supabase error', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      await expect(service.select('test_table')).rejects.toThrow(
        'Supabase select error: Database error',
      );
    });

    it('should return empty array when no results', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.select('test_table');

      expect(result).toEqual([]);
    });
  });

  describe('selectWithCount', () => {
    it('should select data with total count', async () => {
      const mockData = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ];

      const mockQuery = {
        select: jest.fn().mockResolvedValue({
          data: mockData,
          count: 10,
          error: null,
        }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.selectWithCount('test_table');

      expect(result).toEqual({ data: mockData, count: 10 });
    });

    it('should return zero count when no matches', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({
          data: [],
          count: 0,
          error: null,
        }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.selectWithCount('test_table', '*', { id: 999 });

      expect(result.count).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('should throw error when count query fails', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({
          data: null,
          count: null,
          error: { message: 'Count error' },
        }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      await expect(service.selectWithCount('test_table')).rejects.toThrow(
        'Supabase select error: Count error',
      );
    });
  });

  describe('insert', () => {
    it('should insert a single record', async () => {
      const mockData = { id: 1, name: 'New Record' };
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [mockData], error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.insert('test_table', { name: 'New Record' });

      expect(result).toEqual([mockData]);
      expect(mockQuery.insert).toHaveBeenCalledWith([{ name: 'New Record' }]);
    });

    it('should throw error when insert fails', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      await expect(
        service.insert('test_table', { name: 'Test' }),
      ).rejects.toThrow('Supabase insert error: Insert failed');
    });

    it('should return empty array when no data returned', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.insert('test_table', { name: 'Test' });

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update records matching filters', async () => {
      const mockData = { id: 1, name: 'Updated' };
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [mockData], error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.update('test_table', { name: 'Updated' }, { id: 1 });

      expect(result).toEqual([mockData]);
      expect(mockQuery.update).toHaveBeenCalledWith({ name: 'Updated' });
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 1);
    });

    it('should apply multiple filters', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      await service.update(
        'test_table',
        { status: 'inactive' },
        { userId: 5, status: 'active' },
      );

      expect(mockQuery.eq).toHaveBeenCalledTimes(2);
    });

    it('should throw error when update fails', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' },
        }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      await expect(
        service.update('test_table', { name: 'Test' }, { id: 1 }),
      ).rejects.toThrow('Supabase update error: Update failed');
    });
  });

  describe('delete', () => {
    it('should delete records matching filters', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.delete('test_table', { id: 1 });

      expect(result).toBe(true);
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 1);
    });

    it('should apply multiple filters when deleting', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.delete('test_table', { userId: 1, status: 'inactive' });

      expect(result).toBe(true);
      expect(mockQuery.eq).toHaveBeenCalledTimes(2);
    });

    it('should throw error when delete fails', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      await expect(service.delete('test_table', { id: 1 })).rejects.toThrow(
        'Supabase delete error: Delete failed',
      );
    });
  });

  describe('count', () => {
    it('should count records in a table', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ count: 42, error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.count('test_table');

      expect(result).toBe(42);
      expect(mockQuery.select).toHaveBeenCalledWith('*', {
        count: 'exact',
        head: true,
      });
    });

    it('should count records with filters', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: 5, error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.count('test_table', { status: 'active' });

      expect(result).toBe(5);
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should return 0 when count is null', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ count: null, error: null }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      const result = await service.count('test_table');

      expect(result).toBe(0);
    });

    it('should throw error when count fails', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({
          count: null,
          error: { message: 'Count operation failed' },
        }),
      };

      jest.spyOn(service.getClient(), 'from').mockReturnValue(mockQuery as any);

      await expect(service.count('test_table')).rejects.toThrow(
        'Supabase count error: Count operation failed',
      );
    });
  });

  describe('rpc', () => {
    it('should call RPC function with parameters', async () => {
      const mockResult = { success: true };
      jest
        .spyOn(service.getClient(), 'rpc')
        .mockResolvedValue({ data: mockResult, error: null });

      const result = await service.rpc('my_function', { userId: 1 });

      expect(result).toEqual(mockResult);
      expect(service.getClient().rpc).toHaveBeenCalledWith('my_function', {
        userId: 1,
      });
    });

    it('should call RPC function without parameters', async () => {
      const mockResult = [];
      jest
        .spyOn(service.getClient(), 'rpc')
        .mockResolvedValue({ data: mockResult, error: null });

      const result = await service.rpc('my_function');

      expect(result).toEqual(mockResult);
      expect(service.getClient().rpc).toHaveBeenCalledWith('my_function', undefined);
    });

    it('should return null when RPC returns null', async () => {
      jest
        .spyOn(service.getClient(), 'rpc')
        .mockResolvedValue({ data: null, error: null });

      const result = await service.rpc('my_function');

      expect(result).toBeNull();
    });

    it('should throw error when RPC call fails', async () => {
      jest.spyOn(service.getClient(), 'rpc').mockResolvedValue({
        data: null,
        error: { message: 'RPC execution error' },
      });

      await expect(service.rpc('my_function')).rejects.toThrow(
        'Supabase RPC error: RPC execution error',
      );
    });
  });
});
