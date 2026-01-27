import { Test, TestingModule } from '@nestjs/testing';
import { UserUnitsService } from './user-units.service';
import { SupabaseService } from '../database/supabase.service';

describe('UserUnitsService - Custom Methods', () => {
  let service: UserUnitsService;

  const mockSupabaseService = {
    select: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUnitsForUser', () => {
    it('should return all units for a user', async () => {
      const userUnits = [
        { unit_id: 10, created_at: new Date() },
        { unit_id: 20, created_at: new Date() },
      ];

      const units = [
        { id: 10, name: 'Unit A', type: 'OFFICE', city: 'São Paulo', state: 'SP' },
        { id: 20, name: 'Unit B', type: 'WAREHOUSE', city: 'RJ', state: 'RJ' },
        { id: 30, name: 'Unit C', type: 'OFFICE', city: 'MG', state: 'MG' },
      ];

      mockSupabaseService.select
        .mockResolvedValueOnce(userUnits)
        .mockResolvedValueOnce(units);

      const result = await service.getUnitsForUser(1);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(10);
      expect(result[1].id).toBe(20);
    });

    it('should return empty array when user has no units', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.getUnitsForUser(999);

      expect(result).toEqual([]);
    });

    it('should filter units correctly', async () => {
      const userUnits = [
        { unit_id: 10, created_at: new Date() },
        { unit_id: 20, created_at: new Date() },
      ];

      const allUnits = [
        { id: 10, name: 'Unit A', type: 'OFFICE', city: 'SP', state: 'SP' },
        { id: 15, name: 'Unit X', type: 'OFFICE', city: 'RJ', state: 'RJ' },
        { id: 20, name: 'Unit B', type: 'WAREHOUSE', city: 'RJ', state: 'RJ' },
      ];

      mockSupabaseService.select
        .mockResolvedValueOnce(userUnits)
        .mockResolvedValueOnce(allUnits);

      const result = await service.getUnitsForUser(1);

      expect(result).toHaveLength(2);
      expect(result.map((u) => u.id)).toEqual([10, 20]);
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

      await service.addUnitToUser(1, 10);

      expect(mockSupabaseService.insert).toHaveBeenCalled();
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

    it('should remove multiple units sequentially', async () => {
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

      expect(mockSupabaseService.delete).toHaveBeenCalledWith('user_units', {
        user_id: 1,
      });
      expect(mockSupabaseService.insert).toHaveBeenCalledTimes(3);
    });

    it('should handle empty unit list', async () => {
      mockSupabaseService.delete.mockResolvedValue(true);

      await service.setUnitsForUser(1, []);

      expect(mockSupabaseService.delete).toHaveBeenCalled();
      expect(mockSupabaseService.insert).not.toHaveBeenCalled();
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

    it('should handle insert errors', async () => {
      mockSupabaseService.delete.mockResolvedValue(true);
      mockSupabaseService.insert.mockRejectedValueOnce(
        new Error('Invalid unit'),
      );

      await expect(
        service.setUnitsForUser(1, [10, 20]),
      ).rejects.toThrow('Invalid unit');
    });
  });

  describe('Helper methods', () => {
    it('should transform DTO to database format', () => {
      const createDto = { userId: 1, unitId: 10 };

      const transformed = (service as any).transformForDb(createDto);

      expect(transformed.user_id).toBe(1);
      expect(transformed.unit_id).toBe(10);
    });

    it('should map database format to entity', () => {
      const dbData = {
        id: 1,
        user_id: 5,
        unit_id: 10,
        created_at: new Date('2024-01-01'),
      };

      const mapped = (service as any).mapData(dbData);

      expect(mapped.userId).toBe(5);
      expect(mapped.unitId).toBe(10);
    });

    it('should have correct table configuration', () => {
      expect((service as any).tableName).toBe('user_units');
      const columns = (service as any).columns;
      expect(columns).toContain('user_id as "userId"');
      expect(columns).toContain('unit_id as "unitId"');
    });
  });
});
