import { Test, TestingModule } from '@nestjs/testing';
import { FamilyCompositionService } from './family-composition.service';
import { SupabaseService } from '../database/supabase.service';
import { CreateFamilyCompositionDto } from './dto/family-composition.dto';
import { UpdateFamilyCompositionDto } from './dto/family-composition.dto';

describe('FamilyCompositionService (CRUD with Custom Methods)', () => {
  let service: FamilyCompositionService;

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
        FamilyCompositionService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<FamilyCompositionService>(FamilyCompositionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD - CREATE', () => {
    it('should successfully create new family composition', async () => {
      const createDto: CreateFamilyCompositionDto = {
        familyId: 1,
        personId: 2,
        relationship: 'spouse',
      };
      const mockResult = {
        id: 1,
        familyId: 1,
        personId: 2,
        relationship: 'spouse',
        created_at: new Date(),
      };

      mockSupabaseService.insert.mockResolvedValue([mockResult]);

      const result = await service.create(createDto, 1);

      expect(result.id).toBe(1);
      expect(result.relationship).toBe('spouse');
      expect(mockSupabaseService.insert).toHaveBeenCalled();
    });
  });

  describe('CRUD - READ (findOne)', () => {
    it('should retrieve family composition by id', async () => {
      const mockComposition = {
        id: 1,
        familyId: 1,
        personId: 2,
        relationship: 'spouse',
        created_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([mockComposition]);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.relationship).toBe('spouse');
    });
  });

  describe('CRUD - UPDATE', () => {
    it('should successfully update family composition', async () => {
      const updateDto: UpdateFamilyCompositionDto = { relationship: 'ex-spouse' };
      const updatedResult = {
        id: 1,
        familyId: 1,
        personId: 2,
        relationship: 'ex-spouse',
        updated_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([{ id: 1 }]);
      mockSupabaseService.update.mockResolvedValue([updatedResult]);

      const result = await service.update(1, updateDto, 1);

      expect(result.relationship).toBe('ex-spouse');
    });
  });

  describe('CRUD - COUNT', () => {
    it('should return correct count of family compositions', async () => {
      mockSupabaseService.selectWithCount.mockResolvedValue({
        count: 8,
        data: [],
      });

      const result = await service.count();

      expect(result).toBe(8);
    });
  });

  describe('CUSTOM METHOD - findByFamily', () => {
    it('should return all members of a family', async () => {
      const mockMembers = [
        { id: 1, familyId: 1, personId: 1, relationship: 'head' },
        { id: 2, familyId: 1, personId: 2, relationship: 'spouse' },
        { id: 3, familyId: 1, personId: 3, relationship: 'child' },
      ];

      mockSupabaseService.select.mockResolvedValue(mockMembers);

      const result = await service.findByFamily(1);

      expect(result).toHaveLength(3);
      expect(result[0].familyId).toBe(1);
    });

    it('should return empty array for family with no members', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.findByFamily(999);

      expect(result).toEqual([]);
    });

    it('should preserve relationship information for each member', async () => {
      const mockMembers = [
        { id: 1, familyId: 2, personId: 5, relationship: 'head' },
        { id: 2, familyId: 2, personId: 6, relationship: 'child' },
      ];

      mockSupabaseService.select.mockResolvedValue(mockMembers);

      const result = await service.findByFamily(2);

      expect(result[0].relationship).toBe('head');
      expect(result[1].relationship).toBe('child');
    });
  });
});
