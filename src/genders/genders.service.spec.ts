import { Test, TestingModule } from '@nestjs/testing';
import { GendersService } from './genders.service';
import { SupabaseService } from '../database/supabase.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';

describe('GendersService (CRUD Unit Tests)', () => {
  let service: GendersService;

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
        GendersService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<GendersService>(GendersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CREATE', () => {
    it('should successfully create a new gender', async () => {
      const createDto: CreateGenderDto = { description: 'Outro' };
      const mockResult = {
        id: 3,
        description: 'Outro',
        active: true,
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabaseService.insert.mockResolvedValue([mockResult]);

      const result = await service.create(createDto);

      expect(result.id).toBe(3);
      expect(result.description).toBe('Outro');
      expect(mockSupabaseService.insert).toHaveBeenCalled();
    });
  });

  describe('READ - findOne', () => {
    it('should retrieve a gender by id', async () => {
      const mockGender = {
        id: 1,
        description: 'Masculino',
        active: true,
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([mockGender]);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.description).toBe('Masculino');
    });
  });

  describe('UPDATE', () => {
    it('should successfully update a gender', async () => {
      const updateDto: UpdateGenderDto = {
        description: 'Masculino Atualizado',
      };
      const updatedResult = {
        id: 1,
        description: 'Masculino Atualizado',
        active: true,
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([
        {
          id: 1,
          description: 'Masculino',
          active: true,
        },
      ]);
      mockSupabaseService.update.mockResolvedValue([updatedResult]);

      const result = await service.update(1, updateDto);

      expect(result.description).toBe('Masculino Atualizado');
    });
  });

  describe('COUNT', () => {
    it('should return correct count of genders', async () => {
      mockSupabaseService.selectWithCount.mockResolvedValue({
        count: 3,
        data: [],
      });

      const result = await service.count();

      expect(result).toBe(3);
    });
  });
});
