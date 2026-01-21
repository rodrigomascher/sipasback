# 📌 Referência Rápida - Dados de Sessão JWT

## Tabela Comparativa: ASP → JWT NestJS

| Dado ASP | JWT NestJS | Campo | Tipo | Seguro? |
|----------|-----------|-------|------|---------|
| acesso | - | (sempre true em token válido) | - | ✅ |
| idUsuario | `sub` | user.sub | number | ✅ |
| usuario | `usuario` | user.usuario | string | ✅ |
| usuarioFuncao | `usuarioFuncao` | user.usuarioFuncao | string | ✅ |
| idfuncionario | `idFuncionario` | user.idFuncionario | number\|null | ✅ |
| **idUnidade** | **`idUnidade`** | **user.idUnidade** | **number** | **✅** |
| latitude | ❌ | Não incluir | - | ✅ (segurança) |
| longitude | ❌ | Não incluir | - | ✅ (segurança) |
| unidade | `unidade` | user.unidade | string | ✅ |
| tipounidade | `tipoUnidade` | user.tipoUnidade | string | ✅ |
| cidade | `cidade` | user.cidade | string | ✅ |
| uf | `uf` | user.uf | string | ✅ |
| unidadeblindada | `unidadeBlindada` | user.unidadeBlindada | boolean | ✅ |
| idSecretaria | `idSecretaria` | user.idSecretaria | number | ✅ |
| secretaria | `secretaria` | user.secretaria | string | ✅ |
| idFuncaoUsuario | `idFuncaoUsuario` | user.idFuncaoUsuario | number\|null | ✅ |
| idtecnicoas | `idTecnicoAS` | user.idTecnicoAS | boolean | ✅ |
| **keyAPI** | **❌ NUNCA** | **Usar endpoint** | **-** | **🔓 CRÍTICO** |

---

## Como Acessar os Dados

### Em Qualquer Controller Protegido

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Get('exemplo')
@UseGuards(JwtAuthGuard)  // Proteger rota
async exemplo(@GetUser() user: any) {
  // Acessar dados:
  const userId = user.sub;                    // ID do usuário
  const nomeUsuario = user.usuario;           // Nome
  const unidade = user.unidade;               // Unidade (equivalente a sessao("unidade"))
  const idUnidade = user.idUnidade;           // ID da unidade
  const funcao = user.usuarioFuncao;          // Função/cargo
  const secretaria = user.secretaria;         // Secretaria
  const blindada = user.unidadeBlindada;      // É blindada?
  const tecnicoAS = user.idTecnicoAS;         // É técnico AS?
  
  return { userId, nomeUsuario, unidade, funcao, secretaria };
}
```

---

## Login e Obtenção do Token

### 1. Fazer Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "usuario": "Admin User",
    "usuarioFuncao": "Administrador",
    "unidade": "sede",
    "idUnidade": 1
  }
}
```

### 2. Usar o Token
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Verificar Dados do Token

### Endpoint de Teste (Swagger)
```
GET /example/session-data
```

**Resposta:**
```json
{
  "success": true,
  "message": "Dados de sessão obtidos com sucesso",
  "data": {
    "userId": 1,
    "email": "admin@example.com",
    "usuario": "Admin User",
    "idFuncionario": 123,
    "idUnidade": 1,
    "unidade": "sede",
    "tipoUnidade": "Matriz",
    "idSecretaria": 1,
    "secretaria": "Secretaria de Administração",
    "idFuncaoUsuario": 5,
    "usuarioFuncao": "Administrador",
    "idTecnicoAS": false,
    "unidadeBlindada": true,
    "cidade": "São Paulo",
    "uf": "SP",
    "issuedAt": "2025-01-21T10:30:00.000Z",
    "expiresAt": "2025-01-21T11:30:00.000Z"
  }
}
```

---

## Dados que Mudaram de Nome

| ASP | NestJS |
|-----|--------|
| `usuario` | `usuario` ✅ |
| `usuarioFuncao` | `usuarioFuncao` ✅ |
| `idfuncionario` | `idFuncionario` ✅ (camelCase) |
| `idUnidade` | `idUnidade` ✅ |
| `tipounidade` | `tipoUnidade` ✅ (camelCase) |
| `unidadeblindada` | `unidadeBlindada` ✅ (camelCase) |
| `idSecretaria` | `idSecretaria` ✅ |
| `idFuncaoUsuario` | `idFuncaoUsuario` ✅ |
| `idtecnicoas` | `idTecnicoAS` ✅ (camelCase) |

---

## Migração de Código ASP

### Antes (ASP):
```vbscript
dim unidade = sessao("unidade")
dim funcao = sessao("usuarioFuncao")
dim idUser = sessao("idUsuario")
```

### Depois (NestJS):
```typescript
// No seu controller
@Get('dados')
@UseGuards(JwtAuthGuard)
async dados(@GetUser() user: any) {
  const unidade = user.unidade;           // Igual!
  const funcao = user.usuarioFuncao;      // Igual!
  const idUser = user.sub;                // sub = idUsuario
  
  return { unidade, funcao, idUser };
}
```

---

## Segurança

### ❌ NÃO FAÇA
```typescript
// Expor a chave de API
const keyAPI = "AIzaSyC3PSwxpXdhxzvIhriO2X9JnfKoRebr7UM";

// Incluir no JWT
const payload = { keyAPI }; // ❌ ERRADO!
```

### ✅ FAÇA
```typescript
// Usar .env para segredar
// .env
GOOGLE_API_KEY=AIzaSyC3PSwxpXdhxzvIhriO2X9JnfKoRebr7UM

// No código
const apiKey = process.env.GOOGLE_API_KEY;
```

### Obter Dados Dinâmicos
```typescript
// Localização (latitude, longitude) - NÃO no JWT!
// Ao invés, criar endpoint:

@Get('localizacao')
@UseGuards(JwtAuthGuard)
async getLocalizacao(@GetUser() user: any) {
  // Buscar do banco
  const localizacao = await db.unidades.findOne(user.idUnidade);
  return { 
    latitude: localizacao.latitude,
    longitude: localizacao.longitude 
  };
}
```

---

## Exemplo Completo de Migração

### Antes (ASP):
```vbscript
if not isEmpty(sessao("acesso")) then
    set rs = conn.execute("SELECT * FROM pedidos WHERE id_unidade = " & sessao("idUnidade"))
    ' ...
end if
```

### Depois (NestJS):
```typescript
@Get('pedidos')
@UseGuards(JwtAuthGuard)
async getPedidos(@GetUser() user: any) {
  // Token válido = acesso garantido
  const pedidos = await this.db.pedidos.find({
    where: { idUnidade: user.idUnidade }
  });
  return pedidos;
}
```

---

## Dúvidas Frequentes

**P: Posso adicionar mais campos ao JWT?**
R: Sim, mas mantenha pequeno. Cada campo = mais dados trafegando.

**P: Como regenerar o token com novos dados?**
R: Faça login novamente. Tokens são imutáveis após criação.

**P: E se os dados do usuário mudarem?**
R: O próximo login terá os dados atualizados. Para mudar na sessão atual, use refresh tokens.

**P: Quem pode ler o JWT?**
R: Qualquer um pode decodificar (é apenas Base64), mas não pode falsificar (assinado com segredo).

**P: Onde armazenar o token no frontend?**
R: `localStorage` (cuidado com XSS) ou `cookie` com `HttpOnly` (mais seguro).

---

## Próximos Passos

- [ ] Implementar Refresh Tokens (renovação sem login)
- [ ] Adicionar Rate Limiting
- [ ] Implementar Logout com Blacklist
- [ ] Conectar com banco de dados real
- [ ] Adicionar Auditoria de Login
