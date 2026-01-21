# SIPAS Backend - NestJS API

Backend com autenticação JWT e documentação Swagger.

## 📋 Funcionalidades

- ✅ Autenticação com JWT
- ✅ Documentação Swagger automática
- ✅ Módulo de usuários com CRUD
- ✅ Guards de autenticação
- ✅ Validação de dados com class-validator
- ✅ Estrutura escalável e modular

## 🚀 Iniciando

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
npm install
```

### Configuração de Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

### Executar em Desenvolvimento

```bash
npm run start:dev
```

O servidor estará disponível em: `http://localhost:3000`

Swagger disponível em: `http://localhost:3000/docs`

### Executar em Produção

```bash
npm run build
npm run start:prod
```

## 📚 Documentação da API

Acesse o Swagger em `http://localhost:3000/docs` para ver toda a documentação da API.

### Endpoints Principais

#### Autenticação

- **POST** `/auth/login` - Fazer login
  - Body: `{ "email": "admin@example.com", "password": "password123" }`
  - Retorna: JWT token

- **POST** `/auth/register` - Registrar novo usuário
  - Body: `{ "email": "user@example.com", "password": "password123" }`

#### Usuários (Requer autenticação)

- **GET** `/users` - Listar todos os usuários
- **GET** `/users/:id` - Obter usuário por ID
- **POST** `/users` - Criar novo usuário
- **PATCH** `/users/:id` - Atualizar usuário
- **DELETE** `/users/:id` - Deletar usuário

## 🔐 Autenticação

### Usando JWT Token

1. Faça login em `/auth/login`:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

2. Use o token retornado em requisições protegidas:
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📁 Estrutura do Projeto

```
src/
├── auth/
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── auth-response.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── auth.module.ts
├── users/
│   ├── dto/
│   │   └── user.dto.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── users.module.ts
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run start
npm run start:dev      # Com hot reload
npm run start:debug    # Com debug

# Produção
npm run build
npm run start:prod

# Testes
npm run test
npm run test:watch
npm run test:cov       # Com cobertura

# Linting
npm run lint
npm run format
```

## 📝 Credenciais de Teste

Para testar a API, use estas credenciais:

- Email: `admin@example.com`
- Senha: `password123`

## 🔄 Próximos Passos

- [ ] Conectar com banco de dados (PostgreSQL/TypeORM)
- [ ] Implementar validação de registro
- [ ] Adicionar refresh tokens
- [ ] Implementar rate limiting
- [ ] Adicionar logging
- [ ] Adicionar tratamento de exceções global
- [ ] Implementar testes automatizados

## 📄 Licença

MIT
