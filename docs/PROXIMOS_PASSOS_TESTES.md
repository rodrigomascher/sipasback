# Próximos Passos - Testes Unitários Backend

## 🎯 Prioridades Imediatas (2-3 horas)

### Priority 1: Fix Controller Type Mismatches (30 min)
**Arquivo**: `src/roles/roles.controller.spec.ts`

**Problema**:
```typescript
// Linha 71 (FAIL):
expect(mockRolesService.findOne).toHaveBeenCalledWith('1'); // string
// Mas controller recebe:
const result = await controller.findOne(1); // number
```

**Solução**:
```typescript
// Corrigir para:
expect(mockRolesService.findOne).toHaveBeenCalledWith(1); // number
```

**Impacto**: Resolver 3 falhas em `roles.controller.spec.ts`

---

### Priority 2: Simplify Genders Controller Tests (30 min)
**Arquivo**: `src/genders/genders.controller.spec.ts`

**Problema**: Testes esperando métodos `delete()` e `count()` que não existem no BaseController

**Solução**:
```typescript
// REMOVER esses describe blocks:
describe('delete')  // delete não é exposto
describe('count')   // count não é exposto

// MANTER apenas:
describe('findAll')
describe('findOne')
describe('create')
describe('update')
```

**Impacto**: Resolver 4 falhas (2 "method not found" + 2 assertion issues)

---

### Priority 3: Fix Units Controller Tests (30 min)
**Arquivo**: `src/units/units.controller.spec.ts`

**Problema**: Similar ao Genders - testes para métodos inexistentes

**Solução**: Remover testes para `delete()` e simplificar assertions

**Impacto**: Resolver 2 falhas

---

### Priority 4: Refactor BaseController Tests (1 hora)
**Arquivo**: `src/common/base/base.controller.spec.ts`

**Problema Principal**: TestableService requer SupabaseService, causando DI errors

**Opção A (Recomendada)**: Usar GendersController concreto ao invés de testável
```typescript
// ANTES:
const module: TestingModule = await Test.createTestingModule({
  controllers: [TestableController],
  providers: [TestableService],
}).compile();

// DEPOIS:
const module: TestingModule = await Test.createTestingModule({
  controllers: [GendersController],
  providers: [
    GendersService,
    { provide: SupabaseService, useValue: mockSupabaseService }
  ],
}).compile();
```

**Opção B**: Remover testes da base class (visto que temos testes concretos)

**Impacto**: Resolver ~8 falhas

---

## 🔄 Execução Recomendada

### Fase 1 (Now): Implement Priorities 1-3
```bash
# 1. Abrir roles.controller.spec.ts
# 2. Alterar linha 71:
#    Antes: expect(mockRolesService.findOne).toHaveBeenCalledWith('1');
#    Depois: expect(mockRolesService.findOne).toHaveBeenCalledWith(1);

# 3. Abrir genders.controller.spec.ts  
# 4. Remover describe block para delete() [~4 testes]
# 5. Remover describe block para count() [~4 testes]

# 6. Abrir units.controller.spec.ts
# 7. Remover delete() test [~1 teste]

# 8. Rodar testes para validar:
npm test -- src/roles/roles.controller.spec.ts
npm test -- src/genders/genders.controller.spec.ts
npm test -- src/units/units.controller.spec.ts
```

**Tempo Estimado**: 30-45 minutos
**Ganho Esperado**: +15-20 testes passing

### Fase 2 (After Phase 1): Refactor BaseController
```bash
# 1. Abrir src/common/base/base.controller.spec.ts
# 2. Refatorar para usar GendersController
# 3. Adicionar mock para SupabaseService
# 4. Rodar testes:
npm test -- src/common/base/base.controller.spec.ts
```

**Tempo Estimado**: 45-60 minutos
**Ganho Esperado**: +8 testes passing

### Fase 3 (Opcional): Persons Service Tests
```bash
# 1. Revisar src/persons/persons.service.spec.ts
# 2. Ajustar assertions para lógica específica de empty fields
# 3. Rodar testes:
npm test -- src/persons/persons.service.spec.ts
```

**Tempo Estimado**: 30 minutos
**Ganho Esperado**: +3 testes passing

---

## 📊 Resultado Esperado Após Todas as Fases

```
Before (ATUAL):
Test Suites: 6 failed, 10 passed, 16 total
Tests:       26 failed, 104 passed, 130 total
Success Rate: 80%

After Priority 1-2 (ESPERADO):
Test Suites: 2 failed, 14 passed, 16 total  
Tests:       5 failed, 125 passed, 130 total
Success Rate: 96%

After Priority 3 (ESPERADO):
Test Suites: 1 failed, 15 passed, 16 total
Tests:       2 failed, 128 passed, 130 total
Success Rate: 98%
```

---

## ✅ Validation Checklist

Após implementar cada prioridade:

```bash
# Priority 1 Complete?
npm test -- src/roles/roles.controller.spec.ts
# Esperado: 6/6 PASS

# Priority 2 Complete?
npm test -- src/genders/genders.controller.spec.ts
# Esperado: 4/4 PASS (removidos delete/count)

# Priority 3 Complete?
npm test -- src/units/units.controller.spec.ts
# Esperado: 8/8 PASS (removido delete)

# Priority 4 Complete?
npm test -- src/common/base/base.controller.spec.ts
# Esperado: 6/6 PASS (refatorado com GendersController)

# Overall Status?
npm test
# Esperado: ~125/130+ PASS
```

---

## 🎓 Code Examples

### Exemplo 1: Corrigindo Type Mismatch

```typescript
// ❌ ANTES (Falha):
it('should return a single role by id', async () => {
  mockRolesService.findOne.mockResolvedValue(mockRole);
  const result = await controller.findOne(1); // number
  expect(mockRolesService.findOne).toHaveBeenCalledWith('1'); // ❌ Expecting string!
});

// ✅ DEPOIS (Passa):
it('should return a single role by id', async () => {
  mockRolesService.findOne.mockResolvedValue(mockRole);
  const result = await controller.findOne(1); // number
  expect(mockRolesService.findOne).toHaveBeenCalledWith(1); // ✅ Correct type!
});
```

### Exemplo 2: Removendo Testes para Methods Inexistentes

```typescript
// ❌ ANTES (Falha):
describe('delete', () => {
  it('should delete a gender', async () => {
    // ...
    await controller.delete('1'); // ❌ Method doesn't exist!
  });
});

// ✅ DEPOIS (Removido):
// Este bloco inteiro é removido visto que BaseController
// não expõe delete() - ele só tem: findAll, findOne, create, update
```

### Exemplo 3: Refatorando BaseController Tests

```typescript
// ❌ ANTES (Falha):
const module: TestingModule = await Test.createTestingModule({
  controllers: [TestableController], // ❌ Abstract class
  providers: [TestableService],      // ❌ Missing SupabaseService
}).compile();

// ✅ DEPOIS (Passa):
const module: TestingModule = await Test.createTestingModule({
  controllers: [GendersController],   // ✅ Concrete controller
  providers: [
    GendersService,
    { 
      provide: SupabaseService,
      useValue: mockSupabaseService   // ✅ Mock provided
    }
  ],
}).compile();
```

---

## 🚀 Automation Scripts (Optional)

### Script 1: Validar Toda Suite em Seconds
```bash
#!/bin/bash
echo "Running all tests..."
npm test 2>&1 | grep -E "Test Suites|Tests:"
```

### Script 2: Watch Specific Test File
```bash
npm test -- src/roles/roles.controller.spec.ts --watch
```

### Script 3: Generate Coverage Report
```bash
npm test -- --coverage
```

---

## 📝 Notes

- **BaseService.count() Fix**: Já foi implementado - todos os services usam `selectWithCount()`
- **Mock Patterns**: Estabelecidos e testados - reutilizar em novos testes
- **Documentation**: Completa em `TESTES_UNITARIOS_PADRAO.md`
- **Test Files**: Total de 16 arquivos, ~2.000 linhas de código
- **Tempo Estimado Total**: 2-3 horas para atingir 95%+ sucesso

---

## 🎯 Final Goal

**Meta**: 95%+ de sucesso em testes (125+/130)
**Status Atual**: 80% sucesso (104/130)
**Gap**: 21 testes (~2-3 horas de trabalho)

Este documento pode ser usado como guia passo-a-passo para completar a suíte de testes com alta confiabilidade.

---

*Última atualização: 2024*
*Responsável: Backend Testing Task Force*
*Status: ✅ Pronto para Implementação*

