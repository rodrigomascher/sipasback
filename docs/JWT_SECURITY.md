# 🔐 JWT Payload e Dados de Sessão - Guia de Segurança

## Migração de Sessão ASP para JWT NestJS

Este documento explica como migrar dados de sessão do sistema ASP clássico para JWT no NestJS, mantendo as melhores práticas de segurança.

---

## 📊 Mapeamento de Dados de Sessão

### Dados do Sistema ASP Original

```vbscript
' Dados de Sessão do ASP
sessao.SetValue "acesso", true
sessao.SetValue "idUsuario", rs1("usr_codigo")
sessao.SetValue "usuario", rs1("usr_nome")
sessao.SetValue "usuarioFuncao", rs1("FUNCAO")
sessao.SetValue "idfuncionario", rs1("id_funcionario")
sessao.SetValue "idUnidade", rs1("ID_UNIDADE")
sessao.SetValue "latitude", rs1("cidade_lat")
sessao.SetValue "longitude", rs1("cidade_long")
sessao.SetValue "unidade", lcase(rs1("unidade_nome"))
sessao.SetValue "tipounidade", rs1("tipo_unidade")
sessao.SetValue "cidade", rs1("cidade")
sessao.SetValue "uf", rs1("uf")
sessao.SetValue "unidadeblindada", rs1("unidade_blindada")
sessao.SetValue "idSecretaria", rs1("id_secretaria")
sessao.SetValue "secretaria", rs1("des_secretaria")
sessao.SetValue "idFuncaoUsuario", rs1("ID_FUNCAO")
sessao.SetValue "idtecnicoas", rs1("tecnicoas")
sessao.SetValue "keyAPI", "AIzaSyC3PSwxpXdhxzvIhriO2X9JnfKoRebr7UM"
```

### Novo Payload JWT NestJS

```json
{
  "sub": 1,                           // ID do usuário (standard JWT)
  "email": "admin@example.com",
  "usuario": "João Silva",
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
  "iat": 1674345600,
  "exp": 1674349200
}
```

---

## ✅ O QUE INCLUIR NO JWT

### 1. **Identificadores (IDs)**
```typescript
sub: number;              // ID do usuário (padrão JWT)
idFuncionario: number;    // ID do funcionário
idUnidade: number;        // ID da unidade
idSecretaria: number;     // ID da secretaria
idFuncaoUsuario: number;  // ID da função
```
✅ **Por quê:** Essenciais para queries e autorização

### 2. **Nomes e Descrições**
```typescript
usuario: string;          // Nome do usuário
unidade: string;          // Nome da unidade
secretaria: string;       // Nome da secretaria
usuarioFuncao: string;    // Função/cargo
tipoUnidade: string;      // Tipo de unidade
```
✅ **Por quê:** Necessários para exibição e contexto

### 3. **Flags Booleanas**
```typescript
unidadeBlindada: boolean; // Unidade é blindada?
idTecnicoAS: boolean;     // É técnico AS?
```
✅ **Por quê:** Simples, usadas para lógica e autorização

### 4. **Informações Estáticas de Localização**
```typescript
cidade: string;           // Cidade
uf: string;               // Estado
```
✅ **Por quê:** Mudam raramente, seguras de incluir

### 5. **Timestamps (Automáticos)**
```typescript
iat: number;              // Issued at
exp: number;              // Expires at
```
✅ **Por quê:** Validação de token, padrão JWT

---

## ❌ O QUE NÃO INCLUIR NO JWT

### 1. **Chaves de API e Segredos**
```typescript
// ❌ NUNCA FAÇA ISSO!
keyAPI: "AIzaSyC3PSwxpXdhxzvIhriO2X9JnfKoRebr7UM"
```
**Por quê:**
- O JWT é visível no cliente (localStorage)
- Qualquer pessoa que decodificar verá a chave
- Comprometeria a Google API

**Solução:** Armazene a chave no servidor (.env), nunca compartilhe via JWT

### 2. **Coordenadas Geográficas Dinâmicas**
```typescript
// ❌ EVITE
latitude: number;
longitude: number;
```
**Por quê:**
- Mudam constantemente
- Token teria que ser regenerado a cada movimento
- Expõe localização do usuário indefinidamente
- Risco de segurança e privacidade

**Solução:** Obtenha via endpoint separado quando necessário

### 3. **Dados Sensíveis (PII)**
```typescript
// ❌ NUNCA
cpf: string;
rg: string;
dataNascimento: Date;
telefone: string;
endereco: string;
```
**Por quê:**
- Podem ser decodificados facilmente
- Violam privacidade se JWT for interceptado
- Requisitos de conformidade (LGPD, GDPR)

### 4. **Dados de Pagamento**
```typescript
// ❌ NUNCA
cartao: string;
saldo: number;
salario: number;
```
**Por quê:**
- Risco de segurança crítico
- Potencial para fraude
- Requisitos de conformidade PCI DSS

### 5. **Permissões Granulares (em payload simples)**
```typescript
// ⚠️ CUIDADO - Pode crescer muito
permissions: ["read", "write", "delete", ...100 mais]
```
**Por quê:**
- Aumenta tamanho do JWT
- Difícil de manter e atualizar
- Mudanças requerem novo token

**Solução:** Use sistema de roles (menos itens) ou fetch do servidor

---

## 🔄 Padrão Recomendado: Dados em Dois Lugares

### No JWT (rápido, sem servidor):
```typescript
const jwtPayload = {
  sub: user.id,
  email: user.email,
  roles: ['admin', 'manager'], // Apenas roles
  unidade: user.unidade,
  permissionHash: user.permissionVersion, // Para invalidação
};
```

### No Servidor (seguro, completo):
```typescript
// Endpoint protegido para dados completos
GET /auth/me
GET /auth/session
GET /auth/permissions
```

---

## 🛡️ Boas Práticas de Segurança

### 1. **Validação em Cada Requisição**
```typescript
// Guard valida o token em CADA requisição
@UseGuards(JwtAuthGuard)
async myEndpoint(@GetUser() user: any) {
  // O usuário foi validado!
}
```

### 2. **Expiração Curta**
```typescript
JwtModule.register({
  signOptions: { expiresIn: '1h' }, // Curto = mais seguro
})
```

### 3. **Use Refresh Tokens**
```typescript
// Token de acesso: 1 hora
// Refresh token: 7 dias (armazenado com segurança)
```

### 4. **HTTPS Obrigatório**
```
JWT em HTTP puro = qualquer um pode interceptar
HTTPS = tráfego criptografado
```

### 5. **Ambiente Seguro**
```bash
# .env (nunca commitar)
JWT_SECRET=seu-segredo-aleatorio-muito-longo-123456789
NODE_ENV=production
```

### 6. **Versioning de Permissões**
```typescript
const payload = {
  sub: user.id,
  permVersion: user.permissionVersion, // Incrementar quando mudar
};

// No servidor, comparar:
if (decodedToken.permVersion !== user.permissionVersion) {
  // Token inválido! Forçar novo login
}
```

---

## 💡 Exemplos de Uso no NestJS

### Acessar Dados no Controller
```typescript
@Get('my-data')
@UseGuards(JwtAuthGuard)
async getMyData(@GetUser() user: any) {
  return {
    id: user.sub,
    email: user.email,
    unidade: user.unidade,
    funcao: user.usuarioFuncao,
  };
}
```

### Verificar Permissões
```typescript
@Post('delete-user')
@UseGuards(JwtAuthGuard, AdminGuard) // Múltiplos guards
async deleteUser(@GetUser() user: any) {
  if (user.usuarioFuncao !== 'Administrador') {
    throw new ForbiddenException('Sem permissão');
  }
  // ... deletar
}
```

### Filtrar por Unidade
```typescript
@Get('reports')
@UseGuards(JwtAuthGuard)
async getReports(@GetUser() user: any) {
  // Usar idUnidade do token
  return db.reports.findAll({ 
    where: { idUnidade: user.idUnidade }
  });
}
```

---

## 🔍 Debug e Teste

### Decodificar JWT (https://jwt.io)
```
Copie o token aqui e veja o payload!
```

### Testar no Swagger
1. Faça login: `POST /auth/login`
2. Copie o token retornado
3. Clique no botão "Authorize" (cadeado)
4. Cole: `Bearer <seu_token>`
5. Teste endpoints protegidos

### Verificar Token via CLI
```bash
# Instalar
npm install -g jwt-cli

# Decodificar
jwt decode <seu_token>

# Verificar
jwt verify <seu_token> --secret "seu-secret"
```

---

## 📋 Checklist de Segurança

- [ ] Nenhuma chave de API no JWT
- [ ] Nenhum dado sensível (PII) no JWT
- [ ] JWT com expiração curta (1-2 horas)
- [ ] HTTPS habilitado em produção
- [ ] JWT_SECRET forte e único
- [ ] Refresh tokens implementados (opcional, recomendado)
- [ ] Validação em CADA endpoint protegido
- [ ] Testes de token inválido/expirado
- [ ] Testes de token com payload manipulado
- [ ] Rate limiting implementado

---

## 🚀 Próximas Implementações

```typescript
// 1. Refresh Tokens
POST /auth/refresh

// 2. Logout (invalidar token)
POST /auth/logout

// 3. Validar Permissão
POST /auth/validate

// 4. Dados de Sessão Completos
GET /auth/me

// 5. Guard de Roles
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')

// 6. Auditoria
- Log de login/logout
- Log de ações sensíveis
- Detecção de atividades suspeitas
```

---

## 📚 Referências

- [JWT.io](https://jwt.io)
- [NestJS JWT](https://docs.nestjs.com/recipes/jwt)
- [OWASP - JWT Security](https://owasp.org/www-community/attacks/JSON_Web_Token_(JWT)_weaknesses)
- [RFC 7519 - JWT](https://tools.ietf.org/html/rfc7519)
