# 📋 Padrão de Nomenclatura Padronizado - camelCase

**Versão:** 2.0 (Padronizado)  
**Data:** 21 de Janeiro de 2026

---

## 🎯 Padrão: camelCase em TUDO

Todos os campos do JWT e código seguem **camelCase** consistentemente.

---

## 📊 Estrutura do JWT Payload

```typescript
{
  // Identificação
  sub: 1,                        // ID do usuário (Standard JWT)
  email: "admin@example.com",    // Email
  nome: "João Silva",            // Nome completo

  // Funcionário
  idFuncionario: 123,            // ID do funcionário
  
  // Unidade
  idUnidade: 1,                  // ID da unidade
  nomeUnidade: "sede",           // Nome da unidade
  tipoUnidade: "Matriz",         // Tipo da unidade
  isUnidadeBlindada: true,       // Se é blindada (boolean)

  // Secretaria
  idSecretaria: 1,               // ID da secretaria
  nomeSecretaria: "Administração", // Nome da secretaria

  // Função
  idFuncao: 5,                   // ID da função/cargo
  nomeFuncao: "Administrador",   // Nome da função

  // Flags
  isTecnicoAS: false,            // Se é técnico AS

  // Localização
  cidade: "São Paulo",           // Cidade
  uf: "SP",                      // Estado

  // Timestamps (automáticos)
  iat: 1674345600,               // Emitido em
  exp: 1674349200                // Expira em
}
```

---

## 📐 Regras de Nomenclatura

### 1. **Identificadores (IDs)**
```
Padrão: id + NomeDoRecurso
Exemplos:
  - idUnidade      ✅
  - idFuncao       ✅
  - idSecretaria   ✅
  - idFuncionario  ✅
```

### 2. **Nomes/Descrições**
```
Padrão: nomeDoRecurso
Exemplos:
  - nome           ✅
  - nomeUnidade    ✅
  - nomeFuncao     ✅
  - nomeSecretaria ✅
```

### 3. **Booleanos**
```
Padrão: is + AdjektivoDoCampo
Exemplos:
  - isUnidadeBlindada ✅
  - isTecnicoAS       ✅
  - isAtivo           ✅
```

### 4. **Tipos/Categorias**
```
Padrão: tipo + Categoria
Exemplos:
  - tipoUnidade   ✅
  - tipoUsuario   ✅
```

### 5. **Timestamps**
```
Padrão: Padrão JWT
Exemplos:
  - iat (issued at)     ✅
  - exp (expires at)    ✅
```

### 6. **Email/Dados Simples**
```
Padrão: nomeDoRecurso (minúsculo)
Exemplos:
  - email        ✅
  - cidade       ✅
  - uf           ✅
```

---

## ✅ Antes vs Depois

### Inconsistência (Antiga)
```
❌ usuario           (deveria ser: nome)
❌ usuarioFuncao     (deveria ser: nomeFuncao)
❌ unidade           (deveria ser: nomeUnidade)
❌ secretaria        (deveria ser: nomeSecretaria)
❌ idTecnicoAS       (deveria ser: isTecnicoAS)
❌ unidadeBlindada   (deveria ser: isUnidadeBlindada)
❌ idFuncaoUsuario   (deveria ser: idFuncao)
```

### Padronizado (Nova)
```
✅ nome              (identificação geral)
✅ nomeFuncao        (nome da função/cargo)
✅ nomeUnidade       (nome da unidade)
✅ nomeSecretaria    (nome da secretaria)
✅ isTecnicoAS       (é técnico? sim/não)
✅ isUnidadeBlindada (é blindada? sim/não)
✅ idFuncao          (ID da função)
```

---

## 🗂️ Tabela de Mapeamento Completo

| Campo ASP | Novo Campo NestJS | Tipo | Padrão |
|-----------|------------------|------|--------|
| usr_codigo | sub | number | JWT standard |
| usr_email | email | string | simples |
| usr_nome | nome | string | simples |
| id_funcionario | idFuncionario | number | id + Nome |
| ID_UNIDADE | idUnidade | number | id + Nome |
| unidade_nome | nomeUnidade | string | nome + Recurso |
| tipo_unidade | tipoUnidade | string | tipo + Recurso |
| id_secretaria | idSecretaria | number | id + Nome |
| des_secretaria | nomeSecretaria | string | nome + Recurso |
| ID_FUNCAO | idFuncao | number | id + Nome |
| FUNCAO | nomeFuncao | string | nome + Recurso |
| tecnicoas | isTecnicoAS | boolean | is + Adjetivo |
| unidade_blindada | isUnidadeBlindada | boolean | is + Adjetivo |
| cidade | cidade | string | simples |
| uf | uf | string | simples |
| iat (JWT) | iat | number | JWT standard |
| exp (JWT) | exp | number | JWT standard |

---

## 🔄 Acessar nos Controllers

### Padrão de Acesso Consistente

```typescript
@Get('meu-endpoint')
@UseGuards(JwtAuthGuard)
async meuEndpoint(@GetUser() user: any) {
  // Sempre camelCase
  const id = user.sub;                    // ID
  const nome = user.nome;                 // Nome
  const idUnidade = user.idUnidade;       // ID Unidade
  const nomeUnidade = user.nomeUnidade;   // Nome Unidade
  const nomeFuncao = user.nomeFuncao;     // Nome Função
  const isTecnicoAS = user.isTecnicoAS;   // Flag
  
  return { id, nome, idUnidade, nomeUnidade };
}
```

---

## 📝 Documentação nos Comentários

Cada campo tem documentação clara:

```typescript
@ApiProperty({ example: 1 })
sub: number;  // ID do usuário (Standard JWT)

@ApiProperty({ example: 'João Silva' })
nome: string;  // Nome do usuário

@ApiProperty({ example: 1 })
idUnidade: number;  // ID da unidade

@ApiProperty({ example: 'sede' })
nomeUnidade: string;  // Nome da unidade

@ApiProperty({ example: false })
isTecnicoAS: boolean;  // Se é técnico AS

@ApiProperty({ example: true })
isUnidadeBlindada: boolean;  // Se é unidade blindada
```

---

## ✨ Benefícios da Padronização

1. **Consistência** - Todos sabem exatamente o padrão
2. **Legibilidade** - Código mais fácil de entender
3. **Manutenção** - Menos erros, mais previsível
4. **Automação** - Ferramentas entendem o padrão
5. **Escalabilidade** - Fácil adicionar novos campos
6. **Documentação** - Self-documenting code

---

## 🛠️ Checklist para Novos Campos

Ao adicionar um novo campo ao JWT:

- [ ] Usar camelCase
- [ ] Se é ID: `id + Nome` (ex: `idCidade`)
- [ ] Se é nome: `nome + Recurso` (ex: `nomeCidade`)
- [ ] Se é boolean: `is + Adjetivo` (ex: `isAtivo`)
- [ ] Adicionar documentação no DTO
- [ ] Adicionar exemplo no @ApiProperty
- [ ] Testar compilação
- [ ] Atualizar documentação

---

## 📚 Referência Rápida

```
IDs:       idUnidade, idFuncao, idSecretaria, idFuncionario
Nomes:     nome, nomeUnidade, nomeFuncao, nomeSecretaria
Booleanos: isTecnicoAS, isUnidadeBlindada, isAtivo
Tipos:     tipoUnidade
Simples:   email, cidade, uf
Timestamps: iat, exp
```

---

## 🎯 Padrão Garantido

✅ Compilação sem erros
✅ TypeScript tipagem correta
✅ Swagger documentado
✅ Código limpo e padronizado
✅ Fácil manutenção

---

**Versão Final: Pronto para Produção! 🚀**
