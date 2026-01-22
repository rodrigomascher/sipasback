import { Test, TestingModule } from '@nestjs/testing';
import { PersonsService } from './persons.service';
import { SupabaseService } from '../database/supabase.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/paginated-response.dto';

describe('PersonsService', () => {
  let service: PersonsService;
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
        PersonsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<PersonsService>(PersonsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a person with userId from authenticated user', async () => {
      const createPersonDto: CreatePersonDto = {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-00',
      };

      const userId = 5;
      const mockResult = [{
        id: 1,
        first_name: 'João',
        last_name: 'Silva',
        cpf: '123.456.789-00',
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: null,
      }];

      mockSupabaseService.select.mockResolvedValue([]);
      mockSupabaseService.insert.mockResolvedValue(mockResult);

      const result = await service.create(createPersonDto, userId);

      expect(mockSupabaseService.select).toHaveBeenCalledWith('person', 'id', { cpf: '123.456.789-00' });
      expect(mockSupabaseService.insert).toHaveBeenCalled();
      expect(result.firstName).toBe('João');
      expect(result.lastName).toBe('Silva');
      expect(result.createdBy).toBe(userId);
      expect(result.updatedBy).toBe(userId);
    });

    it('should throw ConflictException if CPF already exists', async () => {
      const createPersonDto: CreatePersonDto = {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-00',
      };

      const existingPerson = [{ id: 999, cpf: '123.456.789-00' }];
      mockSupabaseService.select.mockResolvedValue(existingPerson);

      await expect(service.create(createPersonDto, 5)).rejects.toThrow(
        ConflictException,
      );
      expect(mockSupabaseService.insert).not.toHaveBeenCalled();
    });

    it('should create person without CPF if not provided', async () => {
      const createPersonDto: CreatePersonDto = {
        firstName: 'João',
        lastName: 'Silva',
      };

      const userId = 5;
      const mockResult = [{
        id: 1,
        first_name: 'João',
        last_name: 'Silva',
        cpf: null,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: null,
      }];

      mockSupabaseService.insert.mockResolvedValue(mockResult);

      const result = await service.create(createPersonDto, userId);

      expect(mockSupabaseService.select).not.toHaveBeenCalled();
      expect(result.firstName).toBe('João');
      expect(result.createdBy).toBe(userId);
    });

    it('should convert empty CPF to NULL and allow multiple persons without CPF', async () => {
      const createPersonDto: CreatePersonDto = {
        firstName: 'Maria',
        lastName: 'Santos',
        cpf: '', // Empty CPF should be converted to NULL
      };

      const userId = 5;
      const mockResult = [{
        id: 2,
        first_name: 'Maria',
        last_name: 'Santos',
        cpf: null, // Should be NULL in database
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: null,
      }];

      mockSupabaseService.select.mockResolvedValue([]); // No CPF collision check needed for empty CPF
      mockSupabaseService.insert.mockResolvedValue(mockResult);

      const result = await service.create(createPersonDto, userId);

      expect(mockSupabaseService.select).not.toHaveBeenCalled(); // Should skip duplicate check for empty CPF
      expect(mockSupabaseService.insert).toHaveBeenCalled();
      expect(result.firstName).toBe('Maria');
      expect(result.cpf).toBeNull();
    });

    it('should allow creating multiple persons with empty CPF (unique constraint allows multiple NULL)', async () => {
      const userId = 5;

      // Create first person with empty CPF
      const person1Dto: CreatePersonDto = {
        firstName: 'Person',
        lastName: 'One',
        cpf: '',
      };

      const mockResult1 = [{
        id: 1,
        first_name: 'Person',
        last_name: 'One',
        cpf: null,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: null,
      }];

      mockSupabaseService.select.mockResolvedValue([]);
      mockSupabaseService.insert.mockResolvedValue(mockResult1);

      const result1 = await service.create(person1Dto, userId);
      expect(result1.firstName).toBe('Person');

      // Create second person with empty CPF - should NOT throw constraint error
      const person2Dto: CreatePersonDto = {
        firstName: 'Person',
        lastName: 'Two',
        cpf: '',
      };

      const mockResult2 = [{
        id: 2,
        first_name: 'Person',
        last_name: 'Two',
        cpf: null,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: null,
      }];

      mockSupabaseService.insert.mockResolvedValue(mockResult2);

      const result2 = await service.create(person2Dto, userId);
      expect(result2.firstName).toBe('Person');
      expect(result2.cpf).toBeNull();
      // Both inserts should succeed without unique constraint violation
      expect(mockSupabaseService.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    it('should update person with only updated_by and updated_at', async () => {
      const personId = 1;
      const userId = 6;
      const updatePersonDto: UpdatePersonDto = {
        lastName: 'Santos',
      };

      const fullQuery = 'id, created_by, updated_by, created_unit_id, updated_unit_id, referred_unit_id, created_at, updated_at, notes, first_name, last_name, full_name, social_name, birth_date, sex, gender_id, gender_identity_id, sexual_orientation, race_id, ethnicity_id, community_id, marital_status_id, nationality, origin_country_id, arrival_date_brazil, mother_person_id, father_person_id, mother_rg, father_rg, mother_residence_order, father_residence_order, cpf, nis, nisn, sus_number, rg, rg_issuance_date, rg_state_abbr, rg_issuing_org_id, rg_complementary, photo_id, cert_standard_new, cert_term_number, cert_book, cert_page, cert_issuance_date, cert_state_abbr, cert_registry, cert_year, cert_issuing_org, birth_city, birth_subdistrict, voter_id_number, voter_id_zone, voter_id_section, voter_id_issuance_date, prof_card_number, prof_card_series, prof_card_issuance_date, prof_card_state, military_registration, military_issuance_date, military_reserve_number, income_type_id, monthly_income, annual_income, education_level_id, school_name, completion_year, currently_studying, deceased, death_cert_issuance_date, death_city, cemetery';

      const existingPerson = [{
        id: personId,
        first_name: 'João',
        last_name: 'Silva',
        created_by: 5, // Original creator
        updated_by: 5,
      }];

      const updatedPerson = [{
        id: personId,
        first_name: 'João',
        last_name: 'Santos',
        created_by: 5, // Should NOT change
        updated_by: userId, // Should change
        updated_at: new Date(),
      }];

      mockSupabaseService.select.mockResolvedValue(existingPerson);
      mockSupabaseService.update.mockResolvedValue(updatedPerson);

      const result = await service.update(personId, updatePersonDto, userId);

      expect(mockSupabaseService.select).toHaveBeenCalledWith('person', fullQuery, { id: personId });
      expect(mockSupabaseService.update).toHaveBeenCalled();
      
      const updateCall = mockSupabaseService.update.mock.calls[0];
      expect(updateCall[1].updated_by).toBe(userId);
      expect(updateCall[1].last_name).toBe('Santos');
      expect(updateCall[1].created_by).toBeUndefined(); // Should NOT be in update data
      
      expect(result.createdBy).toBe(5); // Original creator preserved
      expect(result.updatedBy).toBe(userId); // Updated to new user
    });

    it('should throw NotFoundException if person does not exist', async () => {
      const personId = 999;
      const updatePersonDto: UpdatePersonDto = { lastName: 'Santos' };

      mockSupabaseService.select.mockResolvedValue([]);

      await expect(service.update(personId, updatePersonDto, 6)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if updated CPF already exists', async () => {
      const personId = 1;
      const updatePersonDto: UpdatePersonDto = {
        cpf: '999.999.999-99',
      };

      const existingPerson = [{ id: personId }];
      const duplicateCpfPerson = [{ id: 2, cpf: '999.999.999-99' }];

      mockSupabaseService.select
        .mockResolvedValueOnce(existingPerson)
        .mockResolvedValueOnce(duplicateCpfPerson);

      await expect(service.update(personId, updatePersonDto, 6)).rejects.toThrow(
        ConflictException,
      );
      expect(mockSupabaseService.update).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated persons', async () => {
      const paginationQuery = new PaginationQueryDto({
        page: 1,
        pageSize: 10,
      });

      const mockPersons = [
        { id: 1, first_name: 'João', last_name: 'Silva' },
        { id: 2, first_name: 'Maria', last_name: 'Santos' },
      ];

      mockSupabaseService.selectWithCount.mockResolvedValue({
        data: mockPersons,
        count: 2,
      });

      const result = await service.findAll(paginationQuery);

      expect(mockSupabaseService.selectWithCount).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should return empty array if no persons found', async () => {
      const paginationQuery = new PaginationQueryDto({
        page: 1,
        pageSize: 10,
      });

      mockSupabaseService.selectWithCount.mockResolvedValue({
        data: [],
        count: 0,
      });

      const result = await service.findAll(paginationQuery);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a person by ID', async () => {
      const personId = 1;
      const fullQuery = 'id, created_by, updated_by, created_unit_id, updated_unit_id, referred_unit_id, created_at, updated_at, notes, first_name, last_name, full_name, social_name, birth_date, sex, gender_id, gender_identity_id, sexual_orientation, race_id, ethnicity_id, community_id, marital_status_id, nationality, origin_country_id, arrival_date_brazil, mother_person_id, father_person_id, mother_rg, father_rg, mother_residence_order, father_residence_order, cpf, nis, nisn, sus_number, rg, rg_issuance_date, rg_state_abbr, rg_issuing_org_id, rg_complementary, photo_id, cert_standard_new, cert_term_number, cert_book, cert_page, cert_issuance_date, cert_state_abbr, cert_registry, cert_year, cert_issuing_org, birth_city, birth_subdistrict, voter_id_number, voter_id_zone, voter_id_section, voter_id_issuance_date, prof_card_number, prof_card_series, prof_card_issuance_date, prof_card_state, military_registration, military_issuance_date, military_reserve_number, income_type_id, monthly_income, annual_income, education_level_id, school_name, completion_year, currently_studying, deceased, death_cert_issuance_date, death_city, cemetery';
      const mockPerson = [
        { id: personId, first_name: 'João', last_name: 'Silva' },
      ];

      mockSupabaseService.select.mockResolvedValue(mockPerson);

      const result = await service.findOne(personId);

      expect(mockSupabaseService.select).toHaveBeenCalledWith(
        'person',
        fullQuery,
        { id: personId },
      );
      expect(result.id).toBe(personId);
      expect(result.firstName).toBe('João');
    });

    it('should throw NotFoundException if person not found', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a person', async () => {
      const personId = 1;
      const fullQuery = 'id, created_by, updated_by, created_unit_id, updated_unit_id, referred_unit_id, created_at, updated_at, notes, first_name, last_name, full_name, social_name, birth_date, sex, gender_id, gender_identity_id, sexual_orientation, race_id, ethnicity_id, community_id, marital_status_id, nationality, origin_country_id, arrival_date_brazil, mother_person_id, father_person_id, mother_rg, father_rg, mother_residence_order, father_residence_order, cpf, nis, nisn, sus_number, rg, rg_issuance_date, rg_state_abbr, rg_issuing_org_id, rg_complementary, photo_id, cert_standard_new, cert_term_number, cert_book, cert_page, cert_issuance_date, cert_state_abbr, cert_registry, cert_year, cert_issuing_org, birth_city, birth_subdistrict, voter_id_number, voter_id_zone, voter_id_section, voter_id_issuance_date, prof_card_number, prof_card_series, prof_card_issuance_date, prof_card_state, military_registration, military_issuance_date, military_reserve_number, income_type_id, monthly_income, annual_income, education_level_id, school_name, completion_year, currently_studying, deceased, death_cert_issuance_date, death_city, cemetery';
      const mockPerson = [{ id: personId }];

      mockSupabaseService.select.mockResolvedValue(mockPerson);
      mockSupabaseService.delete.mockResolvedValue(undefined);

      const result = await service.remove(personId);

      expect(mockSupabaseService.select).toHaveBeenCalledWith(
        'person',
        fullQuery,
        { id: personId },
      );
      expect(mockSupabaseService.delete).toHaveBeenCalledWith('person', {
        id: personId,
      });
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if person does not exist', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockSupabaseService.delete).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search persons by name', async () => {
      const mockPersons = [
        { id: 1, first_name: 'João', last_name: 'Silva' },
      ];

      mockSupabaseService.select.mockResolvedValue(mockPersons);

      const result = await service.search('João');

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('João');
    });

    it('should return empty array if no match found in search', async () => {
      mockSupabaseService.select.mockResolvedValue([]);

      const result = await service.search('NonExistent');

      expect(result).toHaveLength(0);
    });

    it('should search by CPF', async () => {
      const mockPersons = [
        { id: 1, cpf: '123.456.789-00', first_name: 'João', last_name: 'Silva' },
      ];

      mockSupabaseService.select.mockResolvedValue(mockPersons);

      const result = await service.search('123.456.789-00');

      expect(result).toHaveLength(1);
      expect(result[0].cpf).toBe('123.456.789-00');
    });

    it('should search by NIS', async () => {
      const mockPersons = [
        { id: 1, nis: '123456789-00', first_name: 'João', last_name: 'Silva' },
      ];

      mockSupabaseService.select.mockResolvedValueOnce(mockPersons);

      const result = await service.search('123456789-00');

      expect(result).toHaveLength(1);
      expect(result[0].nis).toBe('123456789-00');
    });
  });

  describe('search with edge cases', () => {
    it('should not search if term is too short (less than 2 characters)', async () => {
      const result = await service.search('A');

      expect(result).toHaveLength(0);
      expect(mockSupabaseService.select).not.toHaveBeenCalled();
    });

    it('should search for NISN', async () => {
      const mockPersons = [
        { id: 1, nisn: '987654321-00', first_name: 'Maria', last_name: 'Santos' },
      ];

      mockSupabaseService.select.mockResolvedValueOnce(mockPersons);

      const result = await service.search('987654321-00');

      expect(result).toHaveLength(1);
      expect(result[0].nisn).toBe('987654321-00');
    });

    it('should return empty array if search term not found', async () => {
      const mockPersons = [
        { id: 1, first_name: 'João', last_name: 'Silva', cpf: '111.111.111-11' },
      ];

      mockSupabaseService.select.mockResolvedValueOnce(mockPersons);

      const result = await service.search('NonExistent');

      expect(result).toHaveLength(0);
    });
  });

  describe('findAll with sorting', () => {
    it('should return paginated persons with sorting by fullName ascending', async () => {
      const paginationQuery = new PaginationQueryDto({
        page: 1,
        pageSize: 10,
        sortBy: 'fullName',
        sortDirection: 'asc',
      });

      const mockPersons = [
        { id: 1, first_name: 'Ana', full_name: 'Ana Silva' },
        { id: 2, first_name: 'João', full_name: 'João Santos' },
      ];

      mockSupabaseService.selectWithCount.mockResolvedValue({
        data: mockPersons,
        count: 2,
      });

      const result = await service.findAll(paginationQuery);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].fullName).toBe('Ana Silva');
    });

    it('should return paginated persons with sorting by birthDate descending', async () => {
      const paginationQuery = new PaginationQueryDto({
        page: 2,
        pageSize: 5,
        sortBy: 'birthDate',
        sortDirection: 'desc',
      });

      const mockPersons = [
        { id: 1, first_name: 'João', birth_date: '2000-01-01' },
        { id: 2, first_name: 'Maria', birth_date: '1990-01-01' },
      ];

      mockSupabaseService.selectWithCount.mockResolvedValue({
        data: mockPersons,
        count: 100,
      });

      const result = await service.findAll(paginationQuery);

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(5);
      expect(result.total).toBe(100);
      expect(result.totalPages).toBe(20);
    });
  });

  describe('update with empty fields', () => {
    it('should convert empty CPF to NULL during update', async () => {
      const personId = 1;
      const userId = 6;
      const updatePersonDto: UpdatePersonDto = {
        cpf: '', // Empty CPF should be converted to NULL
      };

      const fullQuery = 'id, created_by, updated_by, created_unit_id, updated_unit_id, referred_unit_id, created_at, updated_at, notes, first_name, last_name, full_name, social_name, birth_date, sex, gender_id, gender_identity_id, sexual_orientation, race_id, ethnicity_id, community_id, marital_status_id, nationality, origin_country_id, arrival_date_brazil, mother_person_id, father_person_id, mother_rg, father_rg, mother_residence_order, father_residence_order, cpf, nis, nisn, sus_number, rg, rg_issuance_date, rg_state_abbr, rg_issuing_org_id, rg_complementary, photo_id, cert_standard_new, cert_term_number, cert_book, cert_page, cert_issuance_date, cert_state_abbr, cert_registry, cert_year, cert_issuing_org, birth_city, birth_subdistrict, voter_id_number, voter_id_zone, voter_id_section, voter_id_issuance_date, prof_card_number, prof_card_series, prof_card_issuance_date, prof_card_state, military_registration, military_issuance_date, military_reserve_number, income_type_id, monthly_income, annual_income, education_level_id, school_name, completion_year, currently_studying, deceased, death_cert_issuance_date, death_city, cemetery';

      const existingPerson = [{
        id: personId,
        first_name: 'João',
        cpf: '123.456.789-00',
        created_by: 5,
        updated_by: 5,
      }];

      const updatedPerson = [{
        id: personId,
        first_name: 'João',
        cpf: null,
        updated_by: userId,
      }];

      mockSupabaseService.select.mockResolvedValue(existingPerson);
      mockSupabaseService.update.mockResolvedValue(updatedPerson);

      const result = await service.update(personId, updatePersonDto, userId);

      const updateCall = mockSupabaseService.update.mock.calls[0];
      expect(updateCall[1].cpf).toBeNull(); // Should be NULL
      expect(result.cpf).toBeNull();
    });

    it('should skip empty numeric fields during update', async () => {
      const personId = 1;
      const userId = 6;
      const updatePersonDto: UpdatePersonDto = {
        monthlyIncome: '', // Empty numeric field should be skipped
        lastName: 'Santos',
      };

      const fullQuery = 'id, created_by, updated_by, created_unit_id, updated_unit_id, referred_unit_id, created_at, updated_at, notes, first_name, last_name, full_name, social_name, birth_date, sex, gender_id, gender_identity_id, sexual_orientation, race_id, ethnicity_id, community_id, marital_status_id, nationality, origin_country_id, arrival_date_brazil, mother_person_id, father_person_id, mother_rg, father_rg, mother_residence_order, father_residence_order, cpf, nis, nisn, sus_number, rg, rg_issuance_date, rg_state_abbr, rg_issuing_org_id, rg_complementary, photo_id, cert_standard_new, cert_term_number, cert_book, cert_page, cert_issuance_date, cert_state_abbr, cert_registry, cert_year, cert_issuing_org, birth_city, birth_subdistrict, voter_id_number, voter_id_zone, voter_id_section, voter_id_issuance_date, prof_card_number, prof_card_series, prof_card_issuance_date, prof_card_state, military_registration, military_issuance_date, military_reserve_number, income_type_id, monthly_income, annual_income, education_level_id, school_name, completion_year, currently_studying, deceased, death_cert_issuance_date, death_city, cemetery';

      const existingPerson = [{
        id: personId,
        first_name: 'João',
        last_name: 'Silva',
        monthly_income: 5000,
        created_by: 5,
        updated_by: 5,
      }];

      const updatedPerson = [{
        id: personId,
        first_name: 'João',
        last_name: 'Santos',
        monthly_income: 5000, // Should remain unchanged
        updated_by: userId,
      }];

      mockSupabaseService.select.mockResolvedValue(existingPerson);
      mockSupabaseService.update.mockResolvedValue(updatedPerson);

      const result = await service.update(personId, updatePersonDto, userId);

      const updateCall = mockSupabaseService.update.mock.calls[0];
      expect(updateCall[1].monthly_income).toBeUndefined(); // Should NOT be in update data
      expect(updateCall[1].last_name).toBe('Santos');
    });
  });

  describe('edge cases', () => {
    it('should handle person with all optional fields populated', async () => {
      const createPersonDto: CreatePersonDto = {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-00',
        birthDate: '1990-01-01',
        sex: 'M',
        genderId: 1,
        raceId: 2,
        maritalStatusId: 1,
        monthlyIncome: 5000,
        annualIncome: 60000,
        educationLevelId: 5,
      };

      const userId = 5;
      const mockResult = [{
        id: 1,
        first_name: 'João',
        last_name: 'Silva',
        cpf: '123.456.789-00',
        birth_date: '1990-01-01',
        sex: 'M',
        gender_id: 1,
        race_id: 2,
        marital_status_id: 1,
        monthly_income: 5000,
        annual_income: 60000,
        education_level_id: 5,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
      }];

      mockSupabaseService.select.mockResolvedValue([]);
      mockSupabaseService.insert.mockResolvedValue(mockResult);

      const result = await service.create(createPersonDto, userId);

      expect(result.firstName).toBe('João');
      expect(result.monthlyIncome).toBe(5000);
      expect(result.educationLevelId).toBe(5);
    });

    it('should properly map snake_case database fields to camelCase', async () => {
      const mockDatabaseRecord = {
        id: 1,
        first_name: 'João',
        last_name: 'Silva',
        full_name: 'João Silva',
        social_name: 'Johnny',
        birth_date: '1990-01-01',
        gender_identity_id: 2,
        sexual_orientation: 'Heterosexual',
        mother_person_id: 5,
        father_person_id: 3,
        voter_id_zone: 123,
        prof_card_number: '456789',
        military_issuance_date: '2015-01-01',
        death_cert_issuance_date: null,
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabaseService.select.mockResolvedValue([mockDatabaseRecord]);

      const result = await service.findOne(1);

      expect(result.firstName).toBe('João');
      expect(result.lastName).toBe('Silva');
      expect(result.fullName).toBe('João Silva');
      expect(result.socialName).toBe('Johnny');
      expect(result.birthDate).toBe('1990-01-01');
      expect(result.genderIdentityId).toBe(2);
      expect(result.sexualOrientation).toBe('Heterosexual');
      expect(result.motherPersonId).toBe(5);
      expect(result.fatherPersonId).toBe(3);
      expect(result.voterIdZone).toBe(123);
      expect(result.profCardNumber).toBe('456789');
      expect(result.militaryIssuanceDate).toBe('2015-01-01');
      expect(result.deathCertIssuanceDate).toBeNull();
    });
  });
});
