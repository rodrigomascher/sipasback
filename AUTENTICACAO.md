# 🔐 Guia de Autenticação - SIPAS

## Problema: "Não Autorizado" ao Tentar Logar

Você não consegue logar porque **não há usuários na base de dados**.

---

## ✅ Solução 1: Usar API de Seed (Recomendado)

### Passo 1: Iniciar o servidor backend
```bash
cd c:\Users\Admin\Documents\SIPAS\back
npm start
```

### Passo 2: Criar usuário admin via API
Faça uma requisição POST para:
```
POST http://localhost:3000/seed/admin-user
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "credentials": {
    "email": "admin@sipas.gov.br",
    "password": "admin123"
  }
}
```

### Passo 3: Logar no Frontend
- Email: `admin@sipas.gov.br`
- Senha: `admin123`

---

## ✅ Solução 2: Usar SQL Direto no Supabase (Alternativa)

### Passo 1: Abrir Supabase SQL Editor
1. Acesse https://supabase.com (login com sua conta)
2. Selecione o projeto SIPAS
3. Vá em **SQL Editor**
4. Crie uma nova query

### Passo 2: Executar Script de Seed
Copie todo o conteúdo do arquivo:
```
c:\Users\Admin\Documents\SIPAS\back\db\seed-admin-user.sql
```

E execute no SQL Editor do Supabase.

### Passo 3: Logar
- Email: `admin@sipas.gov.br`
- Senha: `admin123`

---

## 📋 Credenciais de Teste

| Campo | Valor |
|-------|-------|
| **Email** | admin@sipas.gov.br |
| **Senha** | admin123 |
| **Nome** | Administrador |
| **Role** | Administrador |
| **Unidade** | Unidade Central (Sede) |

---

## 🔍 Troubleshooting

### Se receber "Invalid credentials"
1. ✅ Verifique se o seed foi executado (Solução 1 ou 2)
2. ✅ Verifique se a senha está correta: `admin123`
3. ✅ Verifique se o email está correto: `admin@sipas.gov.br`
4. ✅ Verifique se `is_active = true` na tabela `users`

### Se receber "Database connection error"
1. ✅ Verifique a URL do Supabase em `.env`
2. ✅ Verifique se o token do Supabase é válido
3. ✅ Verifique se as migrações foram rodadas

### Se receber "500 Internal Server Error"
1. ✅ Verifique os logs do backend: `npm start`
2. ✅ Procure por erros de conexão com banco de dados
3. ✅ Verifique se `SupabaseService` está injetado corretamente

---

## 🗄️ Estrutura de Dados Criadas

O script de seed cria:
- ✅ **Usuário**: admin@sipas.gov.br
- ✅ **Departamento**: Administração
- ✅ **Unidade**: Unidade Central (Sede)
- ✅ **Role**: Administrador
- ✅ **Vínculos**: user_units, user_departments, user_roles

---

## 🔒 Segurança

- ❌ Não use essas credenciais em produção
- ✅ Mude a senha após o primeiro login
- ✅ Crie um usuário com senha forte
- ✅ Considere usar 2FA

---

## 📝 Notas

- A senha `admin123` é apenas para testes
- O hash bcrypt da senha está em: `db/seed-admin-user.sql`
- Para produção, use variáveis de ambiente para senhas

---

**Próximo Passo:** Após logar, você será redirecionado para selecionar uma unidade.
