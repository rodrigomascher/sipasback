import { Test, TestingModule } from '@nestjs/testing';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

describe('PersonsController', () => {
  let controller: PersonsController;
  let service: PersonsService;

  const mockPersonsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonsController],
      providers: [
        {
          provide: PersonsService,
          useValue: mockPersonsService,
        },
      ],
    }).compile();

    controller = module.get<PersonsController>(PersonsController);
    service = module.get<PersonsService>(PersonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /persons', () => {
    it('should create a new person', async () => {
      const createPersonDto: CreatePersonDto = {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-00',
        birthDate: '1990-01-15',
        raceId: 2,
        ethnicityId: 1,
        incomeTypeId: 3,
        maritalStatusId: 1,
      };

      const mockPerson = {
        id: 1,
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-00',
        birthDate: '1990-01-15',
        raceId: 2,
        ethnicityId: 1,
        incomeTypeId: 3,
        maritalStatusId: 1,
        createdBy: 5,
        createdAt: new Date(),
      };

      mockPersonsService.create.mockResolvedValue(mockPerson);

      const result = await controller.create(createPersonDto, { id: 5 } as any);

      expect(result).toEqual(mockPerson);
      expect(mockPersonsService.create).toHaveBeenCalledWith(createPersonDto, 5);
    });

    it('should create person with minimal data', async () => {
      const createPersonDto: CreatePersonDto = {
        firstName: 'João',
        lastName: 'Silva',
      };

      const mockPerson = {
        id: 1,
        firstName: 'João',
        lastName: 'Silva',
        createdBy: 5,
        createdAt: new Date(),
      };

      mockPersonsService.create.mockResolvedValue(mockPerson);

      const result = await controller.create(createPersonDto, { id: 5 } as any);

      expect(result).toEqual(mockPerson);
    });

    it('should create person with all relationship fields', async () => {
      const createPersonDto: CreatePersonDto = {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-00',
        motherPersonId: 10,
        fatherPersonId: 11,
        familyCompositionId: 3,
        relationshipDegreeId: 1,
      };

      const mockPerson = {
        id: 1,
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-00',
        motherPersonId: 10,
        fatherPersonId: 11,
        familyCompositionId: 3,
        relationshipDegreeId: 1,
        createdBy: 5,
        createdAt: new Date(),
      };

      mockPersonsService.create.mockResolvedValue(mockPerson);

      const result = await controller.create(createPersonDto, { id: 5 } as any);

      expect(result.motherPersonId).toBe(10);
      expect(result.fatherPersonId).toBe(11);
    });
  });

  describe('GET /persons', () => {
    it('should return paginated list of persons', async () => {
      const mockResponse = {
        data: [
          { id: 1, firstName: 'João', lastName: 'Silva', cpf: '123.456.789-00' },
          { id: 2, firstName: 'Maria', lastName: 'Santos', cpf: '987.654.321-00' },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockPersonsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10', 'firstName', 'asc', '');

      expect(result.data.length).toBe(2);
      expect(result.totalCount).toBe(2);
    });

    it('should search persons by CPF', async () => {
      const mockResponse = {
        data: [
          { id: 1, firstName: 'João', lastName: 'Silva', cpf: '123.456.789-00' },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockPersonsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10', 'cpf', 'asc', '123');

      expect(result.data.length).toBe(1);
      expect(result.data[0].cpf).toContain('123');
    });

    it('should search persons by name', async () => {
      const mockResponse = {
        data: [
          { id: 1, firstName: 'João', lastName: 'Silva', cpf: '123.456.789-00' },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockPersonsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10', 'firstName', 'asc', 'João');

      expect(result.data[0].firstName).toBe('João');
    });

    it('should handle pagination correctly', async () => {
      const mockResponse = {
        data: [],
        totalCount: 50,
        page: 3,
        pageSize: 10,
        totalPages: 5,
      };

      mockPersonsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('3', '10');

      expect(result.page).toBe(3);
      expect(result.totalPages).toBe(5);
    });
  });

  describe('GET /persons/:id', () => {
    it('should return a specific person', async () => {
      const mockPerson = {
        id: 1,
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-00',
        birthDate: '1990-01-15',
        raceId: 2,
        ethnicityId: 1,
      };

      mockPersonsService.findOne.mockResolvedValue(mockPerson);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockPerson);
      expect(mockPersonsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return person with all populated fields', async () => {
      const mockPerson = {
        id: 1,
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-00',
        birthDate: '1990-01-15',
        raceId: 2,
        ethnicityId: 1,
        incomeTypeId: 3,
        maritalStatusId: 1,
        genderId: 1,
        genderIdentityId: 2,
        motherPersonId: 10,
        fatherPersonId: 11,
        monthlyIncome: 5000,
        educationLevelId: 5,
      };

      mockPersonsService.findOne.mockResolvedValue(mockPerson);

      const result = await controller.findOne(1);

      expect(result.motherPersonId).toBe(10);
      expect(result.monthlyIncome).toBe(5000);
    });

    it('should return person with null optional fields', async () => {
      const mockPerson = {
        id: 1,
        firstName: 'João',
        lastName: 'Silva',
        cpf: null,
        birthDate: null,
        raceId: null,
        ethnicityId: null,
      };

      mockPersonsService.findOne.mockResolvedValue(mockPerson);

      const result = await controller.findOne(1);

      expect(result.cpf).toBeNull();
      expect(result.birthDate).toBeNull();
    });
  });

  describe('PATCH /persons/:id', () => {
    it('should update a person', async () => {
      const updatePersonDto: UpdatePersonDto = {
        lastName: 'Santos',
        birthDate: '1990-05-20',
      };

      const mockUpdatedPerson = {
        id: 1,
        firstName: 'João',
        lastName: 'Santos',
        cpf: '123.456.789-00',
        birthDate: '1990-05-20',
      };

      mockPersonsService.update.mockResolvedValue(mockUpdatedPerson);

      const result = await controller.update(1, updatePersonDto, { id: 5 } as any);

      expect(result.lastName).toBe('Santos');
      expect(result.birthDate).toBe('1990-05-20');
      expect(mockPersonsService.update).toHaveBeenCalledWith(1, updatePersonDto, 5);
    });

    it('should update only one field', async () => {
      const updatePersonDto: UpdatePersonDto = {
        maritalStatusId: 2,
      };

      const mockUpdatedPerson = {
        id: 1,
        firstName: 'João',
        lastName: 'Silva',
        maritalStatusId: 2,
      };

      mockPersonsService.update.mockResolvedValue(mockUpdatedPerson);

      const result = await controller.update(1, updatePersonDto, { id: 5 } as any);

      expect(result.maritalStatusId).toBe(2);
    });

    it('should update income and education fields', async () => {
      const updatePersonDto: UpdatePersonDto = {
        monthlyIncome: 8000,
        incomeTypeId: 2,
        educationLevelId: 6,
      };

      const mockUpdatedPerson = {
        id: 1,
        firstName: 'João',
        lastName: 'Silva',
        monthlyIncome: 8000,
        incomeTypeId: 2,
        educationLevelId: 6,
      };

      mockPersonsService.update.mockResolvedValue(mockUpdatedPerson);

      const result = await controller.update(1, updatePersonDto, { id: 5 } as any);

      expect(result.monthlyIncome).toBe(8000);
      expect(result.incomeTypeId).toBe(2);
    });
  });

  describe('DELETE /persons/:id', () => {
    it('should delete a person', async () => {
      mockPersonsService.delete.mockResolvedValue(undefined);

      await controller.delete(1, { id: 5 } as any);

      expect(mockPersonsService.delete).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('GET /persons/search', () => {
    it('should search persons by multiple criteria', async () => {
      const mockResponse = {
        data: [
          { id: 1, firstName: 'João', lastName: 'Silva', cpf: '123.456.789-00' },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockPersonsService.search.mockResolvedValue(mockResponse);

      const result = await controller.search({
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-00',
      });

      expect(result.data.length).toBe(1);
      expect(mockPersonsService.search).toHaveBeenCalled();
    });

    it('should search by single field', async () => {
      const mockResponse = {
        data: [
          { id: 1, firstName: 'João', lastName: 'Silva', cpf: '123.456.789-00' },
        ],
        totalCount: 1,
      };

      mockPersonsService.search.mockResolvedValue(mockResponse);

      const result = await controller.search({ cpf: '123.456.789-00' });

      expect(result.data.length).toBe(1);
    });
  });
});
