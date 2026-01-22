import { Test, TestingModule } from '@nestjs/testing';
import { FamilyCompositionController } from './family-composition.controller';
import { FamilyCompositionService } from './family-composition.service';
import { CreateFamilyCompositionDto, UpdateFamilyCompositionDto } from './dto/family-composition.dto';

describe('FamilyCompositionController (CRUD with Custom Methods)', () => {
  let controller: FamilyCompositionController;
  let service: FamilyCompositionService;

  const mockFamilyCompositionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findByFamily: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FamilyCompositionController],
      providers: [
        {
          provide: FamilyCompositionService,
          useValue: mockFamilyCompositionService,
        },
      ],
    }).compile();

    controller = module.get<FamilyCompositionController>(FamilyCompositionController);
    service = module.get<FamilyCompositionService>(FamilyCompositionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    it('should return paginated family compositions', async () => {
      const mockCompositions = [
        { id: 1, familyId: 1, personId: 2, relationship: 'spouse' },
        { id: 2, familyId: 1, personId: 3, relationship: 'child' },
      ];

      mockFamilyCompositionService.findAll.mockResolvedValue({
        data: mockCompositions,
        count: 2,
      });

      const result = await controller.findAll({ limit: 10, offset: 0 });

      expect(result.data).toEqual(mockCompositions);
    });

    it('should get family composition by id', async () => {
      const mockComposition = {
        id: 1,
        familyId: 1,
        personId: 2,
        relationship: 'spouse',
      };

      mockFamilyCompositionService.findOne.mockResolvedValue(mockComposition);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockComposition);
    });

    it('should create family composition', async () => {
      const createDto: CreateFamilyCompositionDto = {
        familyId: 1,
        personId: 2,
        relationship: 'spouse',
      };
      const mockResult = { id: 1, ...createDto };

      mockFamilyCompositionService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto, 1);

      expect(result).toEqual(mockResult);
    });

    it('should update family composition', async () => {
      const updateDto: UpdateFamilyCompositionDto = { relationship: 'ex-spouse' };
      const mockResult = {
        id: 1,
        familyId: 1,
        personId: 2,
        relationship: 'ex-spouse',
      };

      mockFamilyCompositionService.update.mockResolvedValue(mockResult);

      const result = await controller.update(1, updateDto, 1);

      expect(result).toEqual(mockResult);
    });
  });

  describe('Custom Methods', () => {
    it('should find family members by family id', async () => {
      const mockMembers = [
        { id: 1, familyId: 1, personId: 1, relationship: 'head' },
        { id: 2, familyId: 1, personId: 2, relationship: 'spouse' },
        { id: 3, familyId: 1, personId: 3, relationship: 'child' },
      ];

      mockFamilyCompositionService.findByFamily.mockResolvedValue(mockMembers);

      const result = await controller.findByFamily(1);

      expect(result).toEqual(mockMembers);
      expect(mockFamilyCompositionService.findByFamily).toHaveBeenCalledWith(1);
    });

    it('should return empty array for family with no members', async () => {
      mockFamilyCompositionService.findByFamily.mockResolvedValue([]);

      const result = await controller.findByFamily(999);

      expect(result).toEqual([]);
    });
  });
});
