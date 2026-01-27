import { Test, TestingModule } from '@nestjs/testing';
import { UserUnitsService, UserUnit } from './user-units.service';
import { SupabaseService } from '../database/supabase.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserUnitsService', () => {
  let service: UserUnitsService;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    select: jest.fn(),
    selectWithCount: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserUnitsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<UserUnitsService>(UserUnitsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user-unit relationship', async () => {
      const createDto = { userId: 1, unitId: 10 };
      const mockResult = {
        id: 1,
        userId: 1,
        unitId: 10,
        createdAt: new Date(),
      };

      mockSupabaseService.insert.mockResolvedValue([mockResult]);

      const result = await service.create(createDto);

      expect(result).toEqual(mockResult);
      expect(mockSupabaseService.insert).toHaveBeenCalledWith('user_units', {
        user_id: 1,
        unit_id: 10,
      });
    });

    it('should handle insert error gracefully', async () => {
      const createDto = { userId: 1, unitId: 10 };

      mockSupabaseService.insert.mockRejectedValue(
        new Error('Insert failed'),
      );

      await expect(service.create(createDto)).rejects.toThrow('Insert failed');
    });

    it('should transform DTO to database format', async () => {
      const createDto = { userId: 5, unitId: 25 };
      const mockResult = { id: 2, userId: 5, unitId: 25, createdAt: new Date() };

      mockSupabaseService.insert.mockResolvedValue([mockResult]);

      await service.create(createDto);

      expect(mockSupabaseService.insert).toHaveBeenCalledWith('user_units', {
        user_id: 5,
        unit_id: 25,
      });
    });
  });

  describe('findAll', () => {
    it('should return all user-unit relationships', async () => {
      const mockData = [
        { id: 1, user_id: 1, unit_id: 10, created_at: new Date() },
        { id: 2, user_id: 2, unit_id: 20, created_at: new Date() },
      ];

      mockSupabaseService.select.mockResolvedValue(mockData);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(mockSupabaseService.select).toHaveBeenCalledWith(
        'user_units',
        'id, user_id as "userId", unit_id as "unitId", created_at as "createdAt"',
        undefined,
        undefined,
        'asc',
        undefined,
        undefined,
      );
    });

    it('should return empty array when no relationships exist', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should apply pagination options', async () => {
      const mockData = [{ id: 1, user_id: 1, unit_id: 10, created_at: new Date() }];

      mockSupabaseService.select.mockResolvedValue(mockData);

      const result = await service.findAll(1, 10);

      expect(result).toBeDefined();
      expect(mockSupabaseService.select).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a single user-unit relationship by id', async () => {
      const mockData = [
        { id: 1, user_id: 1, unit_id: 10, created_at: new Date() },
      ];

      mockSupabaseService.select.mockResolvedValue(mockData);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.userId).toBe(1);
      expect(result.unitId).toBe(10);
    });

    it('should throw NotFoundException when not found', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw error when query fails', async () => {
      mockSupabaseService.select.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findOne(1)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update a user-unit relationship', async () => {
      const updateDto = { unitId: 20 };
      const mockResult = [
        { id: 1, user_id: 1, unit_id: 20, created_at: new Date() },
      ];

      mockSupabaseService.update.mockResolvedValue(mockResult);

      const result = await service.update(1, updateDto);

      expect(result).toBeDefined();
      expect(result.unitId).toBe(20);
    });

    it('should throw NotFoundException when record does not exist', async () => {
      const updateDto = { unitId: 20 };

      mockSupabaseService.update.mockResolvedValue([]);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should transform update DTO to database format', async () => {
      const updateDto = { userId: 2, unitId: 15 };
      const mockResult = [
        { id: 1, user_id: 2, unit_id: 15, created_at: new Date() },
      ];

      mockSupabaseService.update.mockResolvedValue(mockResult);

      await service.update(1, updateDto);

      expect(mockSupabaseService.update).toHaveBeenCalledWith(
        'user_units',
        {
          user_id: 2,
          unit_id: 15,
        },
        { id: 1 },
      );
    });
  });

  describe('delete', () => {
    it('should delete a user-unit relationship', async () => {
      mockSupabaseService.delete.mockResolvedValue(true);

      const result = await service.delete(1);

      expect(result).toBe(true);
      expect(mockSupabaseService.delete).toHaveBeenCalledWith('user_units', {
        id: 1,
      });
    });

    it('should handle delete error', async () => {
      mockSupabaseService.delete.mockRejectedValue(
        new Error('Delete failed'),
      );

      await expect(service.delete(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('getUnitsForUser', () => {
    it('should return all units for a user', async () => {
      const userUnits = [
        { unit_id: 10, created_at: new Date() },
        { unit_id: 20, created_at: new Date() },
      ];

      const units = [
        { id: 10, name: 'Unit A', type: 'OFFICE', city: 'São Paulo', state: 'SP' },
        { id: 20, name: 'Unit B', type: 'WAREHOUSE', city: 'Rio de Janeiro', state: 'RJ' },
        { id: 30, name: 'Unit C', type: 'OFFICE', city: 'Belo Horizonte', state: 'MG' },
      ];

      mockSupabaseService.select
        .mockResolvedValueOnce(userUnits)
        .mockResolvedValueOnce(units);

      const result = await service.getUnitsForUser(1);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(10);
      expect(result[0].name).toBe('Unit A');
      expect(result[1].id).toBe(20);
    });

    it('should return empty array when user has no units', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.getUnitsForUser(999);

      expect(result).toEqual([]);
    });

    it('should map unit properties correctly', async () => {
      const userUnits = [{ unit_id: 5, created_at: new Date() }];
      const units = [
        { id: 5, name: 'Test Unit', type: 'OFFICE', city: 'São Paulo', state: 'SP' },
      ];

      mockSupabaseService.select
        .mockResolvedValueOnce(userUnits)
        .mockResolvedValueOnce(units);

      const result = await service.getUnitsForUser(1);

      expect(result[0]).toEqual({
        id: 5,
        name: 'Test Unit',
        type: 'OFFICE',
        city: 'São Paulo',
        state: 'SP',
      });
    });

    it('should filter units to only include user assigned units', async () => {
      const userUnits = [
        { unit_id: 10, created_at: new Date() },
        { unit_id: 20, created_at: new Date() },
      ];

      const allUnits = [
        { id: 10, name: 'Unit A', type: 'OFFICE', city: 'SP', state: 'SP' },
        { id: 15, name: 'Unit X', type: 'OFFICE', city: 'RJ', state: 'RJ' },
        { id: 20, name: 'Unit B', type: 'WAREHOUSE', city: 'RJ', state: 'RJ' },
        { id: 30, name: 'Unit C', type: 'OFFICE', city: 'MG', state: 'MG' },
      ];

      mockSupabaseService.select
        .mockResolvedValueOnce(userUnits)
        .mockResolvedValueOnce(allUnits);

      const result = await service.getUnitsForUser(1);

      expect(result).toHaveLength(2);
      expect(result.map((u) => u.id)).toEqual([10, 20]);
      expect(result.map((u) => u.id)).not.toContain(15);
      expect(result.map((u) => u.id)).not.toContain(30);
    });
  });

  describe('getUnitsForUserPaginated', () => {
    it('should return paginated units for a user', async () => {
      const userUnits = [{ unit_id: 10, created_at: new Date() }];
      const units = [
        { id: 10, name: 'Unit A', type: 'OFFICE', city: 'SP', state: 'SP' },
      ];

      mockSupabaseService.select
        .mockResolvedValueOnce(userUnits)
        .mockResolvedValueOnce(units);

      const result = await service.getUnitsForUserPaginated(1, {
        page: 1,
        pageSize: 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result) || result.data).toBeTruthy();
    });

    it('should apply pagination options', async () => {
      const userUnits = [];
      mockSupabaseService.select.mockResolvedValue(userUnits);

      const result = await service.getUnitsForUserPaginated(1, {
        page: 2,
        pageSize: 20,
        sortBy: 'name',
        sortDirection: 'desc',
      });

      expect(result).toBeDefined();
    });

    it('should handle pagination with default options', async () => {
      const userUnits = [];
      mockSupabaseService.select.mockResolvedValue(userUnits);

      const result = await service.getUnitsForUserPaginated(1);

      expect(result).toBeDefined();
    });
  });

  describe('addUnitToUser', () => {
    it('should add a unit to a user', async () => {
      mockSupabaseService.insert.mockResolvedValue([
        { id: 1, user_id: 1, unit_id: 10 },
      ]);

      await service.addUnitToUser(1, 10);

      expect(mockSupabaseService.insert).toHaveBeenCalledWith('user_units', {
        user_id: 1,
        unit_id: 10,
      });
    });

    it('should silently ignore duplicate unit assignment', async () => {
      const duplicateError = new Error('duplicate key value violates unique constraint');

      mockSupabaseService.insert.mockRejectedValue(duplicateError);

      // Should not throw
      await service.addUnitToUser(1, 10);

      expect(mockSupabaseService.insert).toHaveBeenCalledWith('user_units', {
        user_id: 1,
        unit_id: 10,
      });
    });

    it('should throw error for non-duplicate errors', async () => {
      mockSupabaseService.insert.mockRejectedValue(
        new Error('Invalid unit ID'),
      );

      await expect(service.addUnitToUser(1, 999)).rejects.toThrow(
        'Invalid unit ID',
      );
    });

    it('should handle multiple unit assignments', async () => {
      mockSupabaseService.insert.mockResolvedValue([
        { id: 1, user_id: 1, unit_id: 10 },
      ]);

      await service.addUnitToUser(1, 10);
      await service.addUnitToUser(1, 20);
      await service.addUnitToUser(1, 30);

      expect(mockSupabaseService.insert).toHaveBeenCalledTimes(3);
    });
  });

  describe('removeUnitFromUser', () => {
    it('should remove a unit from a user', async () => {
      mockSupabaseService.delete.mockResolvedValue(true);

      await service.removeUnitFromUser(1, 10);

      expect(mockSupabaseService.delete).toHaveBeenCalledWith('user_units', {
        user_id: 1,
        unit_id: 10,
      });
    });

    it('should handle delete error', async () => {
      mockSupabaseService.delete.mockRejectedValue(
        new Error('Delete failed'),
      );

      await expect(service.removeUnitFromUser(1, 10)).rejects.toThrow(
        'Delete failed',
      );
    });

    it('should remove multiple units', async () => {
      mockSupabaseService.delete.mockResolvedValue(true);

      await service.removeUnitFromUser(1, 10);
      await service.removeUnitFromUser(1, 20);

      expect(mockSupabaseService.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('setUnitsForUser', () => {
    it('should replace all units for a user', async () => {
      mockSupabaseService.delete.mockResolvedValue(true);
      mockSupabaseService.insert.mockResolvedValue([
        { id: 1, user_id: 1, unit_id: 10 },
      ]);

      await service.setUnitsForUser(1, [10, 20, 30]);

      // First call should delete all existing units
      expect(mockSupabaseService.delete).toHaveBeenCalledWith('user_units', {
        user_id: 1,
      });

      // Then insert new units
      expect(mockSupabaseService.insert).toHaveBeenCalledTimes(3);
    });

    it('should handle empty unit list (remove all)', async () => {
      mockSupabaseService.delete.mockResolvedValue(true);

      await service.setUnitsForUser(1, []);

      // Should only delete, not insert
      expect(mockSupabaseService.delete).toHaveBeenCalledWith('user_units', {
        user_id: 1,
      });
      expect(mockSupabaseService.insert).not.toHaveBeenCalled();
    });

    it('should handle null unit list', async () => {
      mockSupabaseService.delete.mockResolvedValue(true);

      await service.setUnitsForUser(1, null as any);

      expect(mockSupabaseService.delete).toHaveBeenCalledWith('user_units', {
        user_id: 1,
      });
    });

    it('should insert units in correct order', async () => {
      mockSupabaseService.delete.mockResolvedValue(true);
      mockSupabaseService.insert.mockResolvedValue([{}]);

      const unitIds = [50, 60, 70];
      await service.setUnitsForUser(5, unitIds);

      const calls = mockSupabaseService.insert.mock.calls;
      expect(calls).toHaveLength(3);
      expect(calls[0][1].unit_id).toBe(50);
      expect(calls[1][1].unit_id).toBe(60);
      expect(calls[2][1].unit_id).toBe(70);
    });

    it('should handle insert errors during setUnitsForUser', async () => {
      mockSupabaseService.delete.mockResolvedValue(true);
      mockSupabaseService.insert.mockRejectedValueOnce(
        new Error('Invalid unit'),
      );

      await expect(
        service.setUnitsForUser(1, [10, 20]),
      ).rejects.toThrow('Invalid unit');
    });
  });

  describe('mapData', () => {
    it('should transform database format to entity format', () => {
      const dbData = {
        id: 1,
        user_id: 5,
        unit_id: 10,
        created_at: new Date('2024-01-01'),
      };

      const mapped = (service as any).mapData(dbData);

      expect(mapped.id).toBe(1);
      expect(mapped.userId).toBe(5);
      expect(mapped.unitId).toBe(10);
      expect(mapped.createdAt).toBeDefined();
    });

    it('should handle camelCase properties from response', () => {
      const responseData = {
        id: 2,
        userId: 8,
        unitId: 15,
        createdAt: new Date(),
      };

      const mapped = (service as any).mapData(responseData);

      expect(mapped.userId).toBe(8);
      expect(mapped.unitId).toBe(15);
    });
  });

  describe('transformForDb', () => {
    it('should transform DTO to database format', () => {
      const createDto = { userId: 1, unitId: 10 };

      const transformed = (service as any).transformForDb(createDto);

      expect(transformed.user_id).toBe(1);
      expect(transformed.unit_id).toBe(10);
    });

    it('should handle UpdateUserUnitDto', () => {
      const updateDto = { unitId: 20 };

      const transformed = (service as any).transformForDb(updateDto);

      expect(transformed.unit_id).toBe(20);
    });
  });

  describe('table configuration', () => {
    it('should have correct table name', () => {
      expect((service as any).tableName).toBe('user_units');
    });

    it('should have correct column mapping', () => {
      const columns = (service as any).columns;
      expect(columns).toContain('user_id as "userId"');
      expect(columns).toContain('unit_id as "unitId"');
      expect(columns).toContain('created_at as "createdAt"');
    });
  });
});
