import { Test, TestingModule } from '@nestjs/testing';
import { UnitsService } from './units.service';
import { SupabaseService } from '../database/supabase.service';
import { CreateUnitDto } from './dto/unit.dto';
import { UpdateUnitDto } from './dto/unit.dto';

describe('UnitsService (CRUD Unit Tests with Custom Methods)', () => {
  let service: UnitsService;

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
        UnitsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<UnitsService>(UnitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD - CREATE', () => {
    it('should successfully create a new unit', async () => {
      const createDto: CreateUnitDto = {
        name: 'Unit A',
        city: 'São Paulo',
        state: 'SP',
      };
      const mockResult = {
        id: 1,
        name: 'Unit A',
        city: 'São Paulo',
        state: 'SP',
        created_at: new Date(),
      };

      mockSupabaseService.insert.mockResolvedValue([mockResult]);

      const result = await service.create(createDto);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Unit A');
      expect(mockSupabaseService.insert).toHaveBeenCalled();
    });
  });

  describe('CRUD - READ (findOne)', () => {
    it('should retrieve a unit by id', async () => {
      const mockUnit = {
        id: 1,
        name: 'Unit A',
        city: 'São Paulo',
        state: 'SP',
        created_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([mockUnit]);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.city).toBe('São Paulo');
    });
  });

  describe('CRUD - UPDATE', () => {
    it('should successfully update a unit', async () => {
      const updateDto: UpdateUnitDto = { name: 'Unit A Updated' };
      const updatedResult = {
        id: 1,
        name: 'Unit A Updated',
        city: 'São Paulo',
        state: 'SP',
        updated_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([{ id: 1 }]);
      mockSupabaseService.update.mockResolvedValue([updatedResult]);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe('Unit A Updated');
    });
  });

  describe('CRUD - COUNT', () => {
    it('should return correct count of units', async () => {
      mockSupabaseService.selectWithCount.mockResolvedValue({
        count: 5,
        data: [],
      });

      const result = await service.count();

      expect(result).toBe(5);
    });
  });

  describe('CUSTOM METHOD - findByCity', () => {
    it('should return all units in a specific city', async () => {
      const mockUnits = [
        { id: 1, name: 'Unit A', city: 'São Paulo', state: 'SP' },
        { id: 3, name: 'Unit C', city: 'São Paulo', state: 'SP' },
      ];

      mockSupabaseService.select.mockResolvedValue(mockUnits);

      const result = await service.findByCity('São Paulo');

      expect(result).toHaveLength(2);
      expect(result[0].city).toBe('São Paulo');
      expect(mockSupabaseService.select).toHaveBeenCalled();
    });

    it('should return empty array when city has no units', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.findByCity('Non Existent City');

      expect(result).toEqual([]);
    });
  });

  describe('CUSTOM METHOD - findByState', () => {
    it('should return all units in a specific state', async () => {
      const mockUnits = [
        { id: 1, name: 'Unit A', city: 'São Paulo', state: 'SP' },
        { id: 3, name: 'Unit C', city: 'Campinas', state: 'SP' },
      ];

      mockSupabaseService.select.mockResolvedValue(mockUnits);

      const result = await service.findByState('SP');

      expect(result).toHaveLength(2);
      expect(result[0].state).toBe('SP');
    });

    it('should return empty array when state has no units', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.findByState('XX');

      expect(result).toEqual([]);
    });
  });
});
