# Testes Unitários - Padrão CRUD Backend

## Visão Geral

Este documento define o padrão para criar testes unitários para os CRUDs refatorados na Fase 2 e 3. Todos os testes seguem a estrutura **Arrange-Act-Assert** usando **Jest** e **@nestjs/testing**.

## Status Atual

### Service Tests ✓ (All CRUD Passing)
- ✅ **Genders Service Tests** (`genders.service.spec.ts`) - **7/7 PASSANDO** ✓
- ✅ **Roles Service Tests** (`roles.service.spec.ts`) - **7/7 PASSANDO** ✓
- ✅ **Employees Service Tests** (`employees.service.spec.ts`) - **8/8 PASSANDO** ✓
- ✅ **Departments Service Tests** (`departments.service.spec.ts`) - **7/7 PASSANDO** ✓
- ✅ **FamilyComposition Service Tests** (`family-composition.service.spec.ts`) - **7/7 PASSANDO** ✓
- ✅ **Persons Service Tests** (`persons.service.spec.ts`) - Existing tests
- ✅ **Units Service Tests** (`units.service.spec.ts`) - Custom methods pattern

### Base Tests
- ✅ **Base Service Tests** (`base.service.spec.ts`) - Criado
- ⚠️ **Base Controller Tests** (`base.controller.spec.ts`) - DI issues with TestableService

### Controller Tests
- ⚠️ **Genders Controller Tests** - Assertion issues
- ⚠️ **Units Controller Tests** - Missing delete/count methods
- 📋 **Remaining Controllers** - Template disponível

### Resumo dos Testes

```
Test Suites: 7 passed, 5 failed, 12 total
Tests:       82 passed, 23 failed, 105 total
Success Rate: 78%
```

## Padrão 1: Service Tests (CRUD Básico)

### Template para Service Tests Simples

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
import { SupabaseService } from '../database/supabase.service';
import { CreateYourDto } from './dto/create-your.dto';
import { UpdateYourDto } from './dto/update-your.dto';

describe('YourService (CRUD Unit Tests)', () => {
  let service: YourService;

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
        YourService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CREATE', () => {
    it('should successfully create a new record', async () => {
      const createDto: CreateYourDto = { /* your fields */ };
      const mockResult = { id: 1, ...createDto, created_at: new Date() };

      mockSupabaseService.insert.mockResolvedValue([mockResult]);

      const result = await service.create(createDto);

      expect(result.id).toBe(1);
      expect(mockSupabaseService.insert).toHaveBeenCalled();
    });
  });

  describe('READ - findOne', () => {
    it('should retrieve a record by id', async () => {
      const mockRecord = { id: 1, /* fields */, created_at: new Date() };

      mockSupabaseService.select.mockResolvedValue([mockRecord]);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
    });
  });

  describe('UPDATE', () => {
    it('should successfully update a record', async () => {
      const updateDto: UpdateYourDto = { /* fields */ };
      const updatedResult = { id: 1, ...updateDto, updated_at: new Date() };

      mockSupabaseService.select.mockResolvedValue([{ id: 1 }]);
      mockSupabaseService.update.mockResolvedValue([updatedResult]);

      const result = await service.update(1, updateDto);

      expect(result.id).toBe(1);
    });
  });

  describe('COUNT', () => {
    it('should return correct count', async () => {
      mockSupabaseService.selectWithCount.mockResolvedValue({
        count: 5,
        data: [],
      });

      const result = await service.count();

      expect(result).toBe(5);
    });
  });
});
```

## Padrão 2: Controller Tests (com Métodos Customizados)

### Template para Controller Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourController } from './your.controller';
import { YourService } from './your.service';
import { CreateYourDto } from './dto/create-your.dto';
import { UpdateYourDto } from './dto/update-your.dto';

describe('YourController', () => {
  let controller: YourController;
  let service: YourService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    // Add custom methods here
    customMethod: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YourController],
      providers: [
        {
          provide: YourService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<YourController>(YourController);
    service = module.get<YourService>(YourService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations (Inherited from BaseController)', () => {
    it('should create a new record', async () => {
      const createDto: CreateYourDto = { /* fields */ };
      const mockResult = { id: 1, ...createDto };

      mockService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(result.id).toBe(1);
      expect(mockService.create).toHaveBeenCalledWith(createDto);
    });

    it('should retrieve a single record', async () => {
      const mockRecord = { id: 1, /* fields */ };

      mockService.findOne.mockResolvedValue(mockRecord);

      const result = await controller.findOne('1');

      expect(result.id).toBe(1);
    });

    it('should update a record', async () => {
      const updateDto: UpdateYourDto = { /* fields */ };
      const mockResult = { id: 1, ...updateDto };

      mockService.update.mockResolvedValue(mockResult);

      const result = await controller.update('1', updateDto);

      expect(result.id).toBe(1);
    });

    it('should delete a record', async () => {
      mockService.delete.mockResolvedValue(undefined);

      await controller.delete('1');

      expect(mockService.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('Custom Methods', () => {
    it('should call custom method correctly', async () => {
      const mockResult = [{ id: 1 }, { id: 2 }];

      mockService.customMethod.mockResolvedValue(mockResult);

      const result = await controller.customMethod('param');

      expect(result).toHaveLength(2);
      expect(mockService.customMethod).toHaveBeenCalledWith('param');
    });
  });
});
```

## Executando os Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes de um arquivo específico
```bash
npm test -- genders.service.spec
npm test -- units.controller.spec
```

### Executar com cobertura de código
```bash
npm test -- --coverage
```

### Executar em modo watch
```bash
npm test -- --watch
```

## Controllers Refatorados (Prioridade para Testes)

### ✅ Completos
- [x] Genders Controller & Service
- [x] Gender Identities Controller & Service
- [x] Sexual Orientations Controller & Service
- [x] Relationship Degrees Controller & Service
- [x] Users Controller & Service

### 📋 Em Progresso
- [ ] Units Controller & Service (custom methods: findByCity, findByState, count)
- [ ] Roles Controller & Service (custom method: findByTechnician)
- [ ] Employees Controller & Service (custom methods: findByUnitId, findByDepartmentId, findByRoleId)
- [ ] Departments Controller & Service (custom method: findByUnitId)
- [ ] Family Composition Controller & Service (custom method: findByFamily)
- [ ] Persons Controller & Service (custom method: search)
- [ ] Auth Controller & Service (special case - não segue CRUD padrão)

## Best Practices

### 1. **Nomenclatura dos Testes**
```typescript
describe('YourService', () => {
  describe('CREATE', () => {
    it('should successfully create...', () => {});
  });

  describe('READ', () => {
    it('should retrieve...', () => {});
  });

  describe('UPDATE', () => {
    it('should update...', () => {});
  });

  describe('DELETE', () => {
    it('should delete...', () => {});
  });
});
```

### 2. **Setup/Teardown**
```typescript
beforeEach(async () => {
  // Setup test module
});

afterEach(() => {
  jest.clearAllMocks(); // Sempre limpar mocks após cada teste
});
```

### 3. **Assertions Comuns**
```typescript
// Verificar chamadas de função
expect(mockService.method).toHaveBeenCalled();
expect(mockService.method).toHaveBeenCalledWith(expectedArg);

// Verificar valores
expect(result).toBe(expectedValue);
expect(result).toEqual(expectedObject);
expect(result).toHaveLength(expectedLength);

// Verificar tipos
expect(result).toBeDefined();
expect(result).not.toBeNull();
```

## Estrutura de Mocks

### Mock Service Básico
```typescript
const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};
```

### Mock com Retornos Personalizados
```typescript
mockService.findOne.mockResolvedValue({ id: 1, name: 'Test' });
mockService.findOne.mockRejectedValue(new NotFoundException());
```

## Cobertura Alvo

- **Services**: 80%+ cobertura
- **Controllers**: 70%+ cobertura (lógica de decoradores não é testável)
- **DTOs**: Não requerem testes (apenas validadores)

## Próximas Etapas

1. ✅ Criar tests para Base Service e Base Controller
2. ✅ Criar tests para Genders (exemplo)
3. ✅ Criar tests para Units (com custom methods)
4. 📋 Replicar padrão para Controllers/Services complexos
5. 📋 Adicionar integration tests para fluxos completos
6. 📋 Setup CI/CD com coverage reports

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Practices Guide](https://google.github.io/styleguide/tsguide.html#testing)
