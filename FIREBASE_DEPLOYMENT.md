# 🚀 SIPAS Firebase Deployment - Setup Complete ✅

## Status Atual

O backend foi preparado com sucesso para implantação no Firebase Cloud Functions!

### ✅ Completado

1. **Dependências Firebase Instaladas**
   - ✅ firebase-functions v4.8.0
   - ✅ firebase-admin v12.1.0
   - ✅ express v4.21.1

2. **Arquivos Configurados**
   - ✅ `firebase.json` - Configuração do projeto
   - ✅ `src/main.firebase.ts` - Entrada para Cloud Functions
   - ✅ `.env.production` - Variáveis de ambiente
   - ✅ `package.json` - Scripts de build atualizados
   - ✅ `.firebaserc` - Configuração do Firebase CLI

3. **Build Compilado**
   - ✅ NestJS compilado em `dist/`
   - ✅ Arquivo `dist/main.firebase.js` gerado
   - ✅ Todas as dependências resolvidas

### 📋 Próximos Passos

#### 1️⃣ **Atualizar o Projeto para Plano Blaze** (IMPORTANTE)
```
O Firebase exige o plano Blaze (pay-as-you-go) para Cloud Functions
Spark (gratuito) não suporta APIs necessárias

URL: https://console.firebase.google.com/project/sipas-back/usage/details
```

**Passo a passo:**
1. Abrir o link acima
2. Clique em "Upgrade to Blaze"
3. Adicione um cartão de crédito válido
4. Confirme o upgrade

**Estimativa de Custos:**
- Cloud Functions: $0,40 por 1M invocações + tempo de execução
- Com uso moderado: ~$5-15/mês
- Primeiros 1M invocações/mês são **gratuitos** com Google Cloud Free Tier

#### 2️⃣ **Configurar Variáveis de Ambiente**

Após o upgrade, você precisará das credenciais do Supabase:

**Arquivo: `.env.production`**
```env
# Já configurado
NODE_ENV=production
PORT=3000
API_URL=https://southamerica-east1-sipas-back.cloudfunctions.net/api
CORS_ORIGIN=https://sipas-web.web.app,https://sipas-web.firebaseapp.com
LOG_LEVEL=info

# ADICIONAR DO SUPABASE DASHBOARD (Supabase > Project Settings > API)
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# ADICIONAR DO FIREBASE CONSOLE (Google Cloud > Service Accounts)
FIREBASE_PROJECT_ID=sipas-back
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account@sipas-back.iam.gserviceaccount.com
```

**Como obter credenciais Supabase:**
1. Acesse supabase.com dashboard
2. Selecione seu projeto
3. Settings > API > Copy as needed

**Como obter credenciais Firebase:**
1. Firebase Console > sipas-back
2. Project Settings (ícone ⚙️)
3. Service Accounts tab
4. Generate new private key

#### 3️⃣ **Configurar Secrets no Firebase**

Adicione as variáveis sensíveis ao Firebase Secrets Manager:

```bash
# Com as credenciais preenchidas em .env.production
firebase functions:config:set env.supabase_url="$SUPABASE_URL" \
  env.supabase_key="$SUPABASE_KEY" \
  --project sipas-back
```

Ou manualmente via Console:
1. Firebase Console > sipas-back
2. Cloud Functions
3. Runtime settings > Runtime environment variables

#### 4️⃣ **Deploy para Firebase**

Quando o Blaze estiver ativo e as variáveis configuradas:

```bash
cd c:\Users\Admin\Documents\SIPAS\back

# Build (já feito, mas execute novamente se mudar código)
npm run build

# Deploy
firebase deploy --only functions --project sipas-back
```

**Output esperado:**
```
i  functions: uploading functions code
...
✔ Deploy complete!

Function URL (api):
https://southamerica-east1-sipas-back.cloudfunctions.net/api

Function URL (health):
https://southamerica-east1-sipas-back.cloudfunctions.net/health
```

#### 5️⃣ **Testar a Implantação**

Após deploy bem-sucedido:

```bash
# Health check
curl https://southamerica-east1-sipas-back.cloudfunctions.net/health

# Swagger docs
https://southamerica-east1-sipas-back.cloudfunctions.net/api/docs

# API endpoints (exemplo)
https://southamerica-east1-sipas-back.cloudfunctions.net/api/persons
```

### 📊 Estrutura de Implantação

```
┌─────────────────────────────────────────────┐
│         Firebase Cloud Functions            │
│  (southamerica-east1 / São Paulo)           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  Cloud Function: api                 │   │
│  │  - Rota principal para toda a API    │   │
│  │  - Inicializa NestApp uma única vez  │   │
│  │  - Reutiliza instância por invocação │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  Cloud Function: health              │   │
│  │  - Healthcheck para monitoramento    │   │
│  │  - Usado por load balancer           │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  Configuração:                              │
│  - Runtime: Node.js 20                      │
│  - Memória: 512 MB                          │
│  - Timeout: 60 segundos                     │
│  - Min Instances: 1                         │
│                                             │
└─────────────────────────────────────────────┘
          │
          └─────────────────────────────────────┐
                      │                         │
            ┌─────────▼──────────┐  ┌──────────▼────────┐
            │   Supabase DB      │  │  Firebase Auth    │
            │   (PostgreSQL)     │  │  & Storage        │
            └────────────────────┘  └───────────────────┘
```

### 🔒 Segurança & Boas Práticas

1. **Nunca commitar variáveis sensíveis**
   - `.env.production` não deve estar no git
   - Use Firebase Secrets Manager para produção

2. **CORS configurado apenas para domínios conhecidos**
   - localhost (dev)
   - sipas-web.web.app (prod)

3. **Health endpoint público** (sem autenticação)
   - Monitoramento de uptime
   - Balanceadores de carga

4. **API com autenticação Bearer**
   - JWT tokens do Firebase Auth
   - Verificação por Passport.js

### 📚 Recursos Adicionais

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Supabase Integration](https://supabase.com/docs/guides/integrations/nestjs)
- [Firebase Blaze Pricing](https://firebase.google.com/pricing)

### 🆘 Solução de Problemas

**Erro: "Project must be on Blaze plan"**
→ Siga o passo 2️⃣ acima para fazer upgrade

**Erro: "Cold start takes too long"**
→ Aumente a memória em firebase.json (512MB → 1024MB)
→ Configure minInstances: 1 para manter aquecida

**Erro: "Cannot connect to Supabase"**
→ Verifique as credenciais em .env.production
→ Teste conexão localmente: `npm run start:dev`

**API retorna 404**
→ Swagger docs estão em `/api/docs`
→ Endpoints estão prefixados com `/api`

---

**Status:** ✅ Ready for Blaze upgrade and deployment
**Data:** 23 Jan 2025
