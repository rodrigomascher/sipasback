import { Test, TestingModule } from '@nestjs/testing';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/unit.dto';
import { UpdateUnitDto } from './dto/unit.dto';

describe('UnitsController', () => {
  let controller: UnitsController;
  let service: UnitsService;

  const mockUnitsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findByCity: jest.fn(),
    findByState: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [
        {
          provide: UnitsService,
          useValue: mockUnitsService,
        },
      ],
    }).compile();

    controller = module.get<UnitsController>(UnitsController);
    service = module.get<UnitsService>(UnitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('inherited CRUD operations', () => {
    it('should list all units with pagination', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Unit A', city: 'São Paulo', state: 'SP' },
          { id: 2, name: 'Unit B', city: 'Rio de Janeiro', state: 'RJ' },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      };

      mockUnitsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10', 'name', 'asc');

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockUnitsService.findAll).toHaveBeenCalled();
    });

    it('should get a single unit by id', async () => {
      const mockUnit = {
        id: 1,
        name: 'Unit A',
        city: 'São Paulo',
        state: 'SP',
      };

      mockUnitsService.findOne.mockResolvedValue(mockUnit);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUnit);
      expect(mockUnitsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should create a new unit', async () => {
      const createUnitDto: CreateUnitDto = {
        name: 'Unit C',
        city: 'Belo Horizonte',
        state: 'MG',
      };
      const mockResult = { id: 3, ...createUnitDto };
      const userId = 1;

      mockUnitsService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createUnitDto, { userId });

      expect(result).toEqual(mockResult);
      expect(mockUnitsService.create).toHaveBeenCalledWith(
        createUnitDto,
        userId,
      );
    });

    it('should update a unit', async () => {
      const updateUnitDto: UpdateUnitDto = { name: 'Unit A Updated' };
      const mockResult = {
        id: 1,
        name: 'Unit A Updated',
        city: 'São Paulo',
        state: 'SP',
      };
      const userId = 1;

      mockUnitsService.update.mockResolvedValue(mockResult);

      const result = await controller.update('1', updateUnitDto, { userId });

      expect(result).toEqual(mockResult);
      expect(mockUnitsService.update).toHaveBeenCalledWith(
        1,
        updateUnitDto,
        userId,
      );
    });
  });

  describe('custom methods', () => {
    describe('findByCity', () => {
      it('should return units filtered by city', async () => {
        const mockUnits = [
          { id: 1, name: 'Unit A', city: 'São Paulo', state: 'SP' },
          { id: 3, name: 'Unit C', city: 'São Paulo', state: 'SP' },
        ];

        mockUnitsService.findByCity.mockResolvedValue(mockUnits);

        const result = await controller.findByCity('São Paulo');

        expect(result).toEqual(mockUnits);
        expect(result).toHaveLength(2);
        expect(mockUnitsService.findByCity).toHaveBeenCalledWith('São Paulo');
      });

      it('should return empty array if no units found in city', async () => {
        mockUnitsService.findByCity.mockResolvedValue([]);

        const result = await controller.findByCity('Non Existent City');

        expect(result).toEqual([]);
      });
    });

    describe('findByState', () => {
      it('should return units filtered by state (uppercase)', async () => {
        const mockUnits = [
          { id: 1, name: 'Unit A', city: 'São Paulo', state: 'SP' },
          { id: 3, name: 'Unit C', city: 'Campinas', state: 'SP' },
        ];

        mockUnitsService.findByState.mockResolvedValue(mockUnits);

        const result = await controller.findByState('SP');

        expect(result).toEqual(mockUnits);
        expect(result).toHaveLength(2);
        expect(mockUnitsService.findByState).toHaveBeenCalledWith('SP');
      });

      it('should convert lowercase state to uppercase', async () => {
        mockUnitsService.findByState.mockResolvedValue([]);

        await controller.findByState('sp');

        expect(mockUnitsService.findByState).toHaveBeenCalledWith('SP');
      });
    });
  });
});
