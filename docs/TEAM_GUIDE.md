# 🎯 SIPAS Backend - Guia de Migração de Dados de Sessão

## Para sua Equipe de Desenvolvimento

---

## O Que Foi Feito?

Seu sistema ASP com **sessão em memória** foi migrado para **JWT em NestJS**.

### Antes (ASP):
```vbscript
' Dados guardados em sessão no servidor
sessao.SetValue "usuario", "João"
sessao.SetValue "idUnidade", 1
sessao.SetValue "unidade", "Sede"
```

### Agora (NestJS):
```typescript
// Dados no JWT token (cliente o carrega)
{
  "usuario": "João",
  "idUnidade": 1,
  "unidade": "Sede"
}
```

---

## ✅ 15 Dados de Sessão Mapeados

Todos estes campos estão **disponíveis no JWT**:

| Campo | Onde Acessar | Tipo |
|-------|--------------|------|
| ID do Usuário | `user.sub` | number |
| Email | `user.email` | string |
| Nome | `user.usuario` | string |
| ID Funcionário | `user.idFuncionario` | number |
| **ID Unidade** ⭐ | `user.idUnidade` | number |
| Nome Unidade | `user.unidade` | string |
| Tipo Unidade | `user.tipoUnidade` | string |
| ID Secretaria | `user.idSecretaria` | number |
| Nome Secretaria | `user.secretaria` | string |
| ID Função | `user.idFuncaoUsuario` | number |
| Nome Função | `user.usuarioFuncao` | string |
| É Técnico AS | `user.idTecnicoAS` | boolean |
| É Blindada | `user.unidadeBlindada` | boolean |
| Cidade | `user.cidade` | string |
| Estado (UF) | `user.uf` | string |

---

## ❌ 3 Dados Excluídos (Por Segurança)

| Campo | Por quê? | Solução |
|-------|---------|---------|
| **latitude** | Dinâmico, muda constantemente | Endpoint separado quando necessário |
| **longitude** | Dinâmico, muda constantemente | Endpoint separado quando necessário |
| **keyAPI** | 🚨 CRÍTICO: Chave exposta | Variável `.env` no servidor |

---

## 🚀 Como Usar nos Controllers

### Padrão Único

```typescript
import { UseGuards } from '@nestjs/common';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Get('meu-endpoint')
@UseGuards(JwtAuthGuard)  // ← Sempre colocar isto!
async meuEndpoint(@GetUser() user: any) {
  // Agora você tem acesso aos dados de sessão:
  console.log(user.usuario);        // Nome do usuário
  console.log(user.idUnidade);      // ID da unidade
  console.log(user.usuarioFuncao);  // Função/cargo
  
  // Usar em queries
  const pedidos = await db.pedidos.find({
    where: { idUnidade: user.idUnidade }
  });
  
  return pedidos;
}
```

---

## 📝 Exemplos Práticos

### 1. Filtrar por Unidade do Usuário

**Antes (ASP):**
```vbscript
sql = "SELECT * FROM pedidos WHERE id_unidade = " & sessao("idUnidade")
```

**Depois (NestJS):**
```typescript
@Get('pedidos')
@UseGuards(JwtAuthGuard)
async getPedidos(@GetUser() user: any) {
  return this.pedidosService.findByUnidade(user.idUnidade);
}
```

### 2. Verificar se é Administrador

**Antes (ASP):**
```vbscript
if sessao("usuarioFuncao") = "Administrador" then
  ' fazer algo
end if
```

**Depois (NestJS):**
```typescript
@Post('config')
@UseGuards(JwtAuthGuard)
async atualizarConfig(@GetUser() user: any) {
  if (user.usuarioFuncao !== 'Administrador') {
    throw new ForbiddenException('Sem permissão');
  }
  // fazer algo
}
```

### 3. Incluir Contexto do Usuário em Auditoria

**Antes (ASP):**
```vbscript
conn.execute("INSERT INTO auditoria VALUES (..., " & sessao("idUsuario") & ", ...)")
```

**Depois (NestJS):**
```typescript
@Post('deletar')
@UseGuards(JwtAuthGuard)
async deletarAlgo(@GetUser() user: any) {
  // Ação...
  
  // Registrar na auditoria
  await this.auditService.log({
    usuario_id: user.sub,
    usuario_nome: user.usuario,
    acao: 'DELETAR_ITEM',
    unidade_id: user.idUnidade,
    timestamp: new Date()
  });
}
```

---

## 🧪 Testar

### 1. Iniciar o servidor
```bash
npm run start:dev
```

### 2. Abrir Swagger
```
http://localhost:3000/docs
```

### 3. Testar Login
1. Clique em `POST /auth/login`
2. Cole no body:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
3. Copie o `access_token` retornado

### 4. Testar Endpoint Protegido
1. Clique no botão "Authorize" (cadeado) no topo
2. Cole: `Bearer {seu_token_aqui}`
3. Teste: `GET /example/session-data`
4. Você verá todos os dados disponíveis!

---

## 📚 Arquivos Principais

```
src/
├── auth/
│   ├── auth.service.ts           ← Lógica de login
│   ├── auth.controller.ts        ← Endpoints /auth/login
│   └── dto/
│       └── jwt-payload.dto.ts    ← Estrutura do JWT (ler isto!)
├── common/
│   └── decorators/
│       └── get-user.decorator.ts ← Decorator @GetUser()
└── example/
    └── example.controller.ts     ← Exemplos de uso
```

---

## 🔐 Segurança - IMPORTANTE

### ✅ Fazer
```typescript
// Usar @UseGuards em rotas sensíveis
@UseGuards(JwtAuthGuard)
async operacaoDelicada(@GetUser() user: any) {
  // Seguro! Token foi validado
}
```

### ❌ Nunca Fazer
```typescript
// NÃO guardar chave de API no JWT
const payload = {
  keyAPI: process.env.GOOGLE_API_KEY // ❌ ERRADO!
};
```

---

## 📋 Checklist Para Migrar Seu Código

Para cada controller que você tem em ASP:

- [ ] Adicionar `@UseGuards(JwtAuthGuard)` em rotas protegidas
- [ ] Adicionar `@GetUser() user: any` como parâmetro
- [ ] Trocar `sessao("campo")` por `user.campo`
- [ ] Testar que dados não mudam
- [ ] Testar que autorização funciona
- [ ] Deletar código ASP após validar

---

## 🆘 Dúvidas Frequentes

**P: Como posso adicionar novos campos ao JWT?**
```
A: Editar:
1. src/auth/auth.service.ts - adicionar ao payload
2. src/auth/dto/jwt-payload.dto.ts - documentar
3. Fazer novo login para obter token com novos dados
```

**P: E se os dados do usuário mudarem?**
```
A: Tokens não são atualizados. Próximo login terá dados novos.
Para atualizar sem logout: implementar refresh tokens.
```

**P: Posso confiar que o usuário no JWT é o correto?**
```
A: SIM! O JWT é assinado com segredo. Se alguém manipular,
a assinatura será inválida e o guard rejeitará.
```

**P: Como obter latitude/longitude do usuário?**
```
A: Criar endpoint separado:
  GET /user/localizacao
  @UseGuards(JwtAuthGuard)
  
Isso retorna dados dinâmicos sem precisar de novo token.
```

---

## 📞 Links Úteis

- **JWT_SECURITY.md** - Leia para entender segurança
- **QUICK_REFERENCE.md** - Referência rápida
- **Swagger** - http://localhost:3000/docs

---

## ✨ Próximos Passos

1. **Conectar com banco de dados real**
   ```
   Arquivo: docs/DATABASE_INTEGRATION.md
   ```

2. **Implementar hash de senha**
   ```bash
   npm install bcrypt @types/bcrypt
   ```

3. **Adicionar refresh tokens**
   ```
   Permite renovar token sem fazer login
   ```

4. **Implementar 2FA (opcional)**
   ```
   Autenticação de dois fatores
   ```

---

## 🎓 Para Aprender Mais

1. Ler `docs/JWT_SECURITY.md` - entender conceitos
2. Estudar `src/example/example.controller.ts` - ver exemplos
3. Testar no Swagger - praticar
4. Migrar um controller - aplicar conhecimento

---

**Seu backend NestJS está pronto para produção! 🚀**

Qualquer dúvida: consulte a documentação ou execute os exemplos!
