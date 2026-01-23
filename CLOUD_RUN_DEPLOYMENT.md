# 🚀 SIPAS Backend - Google Cloud Run Deployment Guide

## Overview

Google Cloud Run é uma plataforma **serverless** que roda containers Docker sem custo obrigatório (Free Tier inclui 2M requisições/mês).

### Por que Cloud Run em vez de Cloud Functions?
- ✅ NestJS roda nativamente (sem wrappers)
- ✅ Free tier generoso (2M requisições/mês)
- ✅ Sem Blaze obrigatório
- ✅ Supabase continua funcionando
- ✅ Fácil scaling automático

---

## 📋 Pré-Requisitos

1. **Google Cloud Account** (gratuito)
   - https://cloud.google.com/

2. **Google Cloud SDK instalado**
   ```bash
   # Download em: https://cloud.google.com/sdk/docs/install-sdk
   # Windows: Instale com PowerShell
   ```

3. **gcloud CLI configurado**
   ```bash
   gcloud init
   gcloud auth login
   ```

4. **Docker instalado** (opcional - Cloud Build faz isso)
   - https://www.docker.com/

---

## 🔧 Configuração

### Passo 1: Preparar Variáveis de Ambiente

Edite `.env.cloud-run` com suas credenciais:

```bash
# Supabase credentials (de supabase.com)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=seu-anon-key
SUPABASE_SERVICE_KEY=seu-service-key

# URL que será gerada após deploy (deixe como está por enquanto)
API_URL=https://sua-service-xxxxx-uc.a.run.app/api

# CORS
CORS_ORIGIN=https://sipas-web.web.app,https://sipas-web.firebaseapp.com
```

### Passo 2: Criar arquivo .env.production

```bash
# Copy .env.cloud-run to .env.production
copy .env.cloud-run .env.production

# Edite .env.production com os valores reais
```

### Passo 3: Testar Localmente com Docker (Opcional)

```bash
# Build imagem local
npm run docker:build

# Rodar localmente
npm run docker:run

# Testar
curl http://localhost:3000/health
curl http://localhost:3000/api/docs
```

---

## 🌐 Deploy para Google Cloud Run

### Opção A: Usando Google Cloud Console (Mais Fácil)

1. **Abra Google Cloud Console**
   - https://console.cloud.google.com/

2. **Verifique projeto selecionado**
   - Dropdown no topo > sipas-back

3. **Ative Cloud Run API**
   - Menu > APIs & Services > Library
   - Procure por "Cloud Run API"
   - Clique > Enable

4. **Create Service**
   - Menu > Cloud Run > Create Service
   - Selecione "Continuously deploy from a source repository"
   - Conecte GitHub
   - Selecione repositório SIPAS
   - Branch: main
   - Dockerfile path: `back/Dockerfile`
   - Region: `southamerica-east1` (São Paulo)
   - Cores: 1
   - Memory: 512 MB
   - Timeout: 60 segundos
   - Clique Create

5. **Configurar Variáveis de Ambiente**
   - Service > Edit & Deploy New Revision
   - Runtime settings > Environment variables
   - Adicione cada variável de `.env.production`
   - Deploy

### Opção B: Usando gcloud CLI (Terminal)

```bash
# Fazer login
gcloud auth login

# Selecionar projeto
gcloud config set project sipas-back

# Deploy direto
gcloud run deploy sipas-backend \
  --source . \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --set-env-vars=$(cat .env.production | tr '\n' ',') \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600 \
  --build-config cloudbuild.yaml

# Ou sem cloudbuild.yaml:
gcloud run deploy sipas-backend \
  --source . \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600
```

### Opção C: Usando Cloud Build (Automático)

Crie arquivo `cloudbuild.yaml` na raiz:

```yaml
steps:
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build',
      '-t',
      'gcr.io/$PROJECT_ID/sipas-backend',
      '-f', 'back/Dockerfile',
      'back/'
    ]
  
  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'push',
      'gcr.io/$PROJECT_ID/sipas-backend'
    ]
  
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - run
      - --filename=.
      - --image=gcr.io/$PROJECT_ID/sipas-backend
      - --location=southamerica-east1
      - --namespace=default

images:
  - 'gcr.io/$PROJECT_ID/sipas-backend'

options:
  machineType: 'N1_HIGHCPU_8'

timeout: '1800s'
```

Depois execute:
```bash
gcloud builds submit
```

---

## ✅ Após Deploy

### 1. Obter URL do Serviço

```bash
gcloud run services list
# Procure por "sipas-backend"
# Copie a URL
```

Ou no Console:
- Cloud Run > sipas-backend
- Copie "Service URL"

### 2. Atualizar Variáveis de Ambiente

```bash
# Use a URL obtida no passo anterior
API_URL=https://sipas-backend-xxxxx-uc.a.run.app/api

# Redeploy com a URL correta
gcloud run deploy sipas-backend \
  --set-env-vars API_URL="https://sipas-backend-xxxxx-uc.a.run.app/api"
```

### 3. Testar Endpoints

```bash
# Health check
curl https://sipas-backend-xxxxx-uc.a.run.app/health

# Swagger docs
https://sipas-backend-xxxxx-uc.a.run.app/api/docs

# API (exemplo)
curl https://sipas-backend-xxxxx-uc.a.run.app/api/persons
```

### 4. Verificar Logs

```bash
# Tempo real
gcloud run services describe sipas-backend --region southamerica-east1

# Ver logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=sipas-backend" \
  --limit 50 \
  --region southamerica-east1 \
  --format json
```

---

## 💰 Custos

### Free Tier (por mês)
```
✅ 2.000.000 requisições    → GRÁTIS
✅ 360.000 GB-segundos      → GRÁTIS
✅ 1 GB armazenamento       → GRÁTIS
```

### Depois dos limites
```
Requisição:     $0,24 por 1M
Compute time:   $0,00002400 por GB-segundo
Egress:         $0,10 por GB
Armazenamento:  $0,18 por GB
```

### Estimativa para SIPAS
```
Cenário 1 (10k req/dia):
- Requisições: 300k/mês ✅ FREE
- Compute: ~3 horas ✅ FREE
- Total: R$ 0,00

Cenário 2 (100k req/dia):
- Requisições: 3M/mês → $0,24
- Compute: ~30 horas → $1,73
- Total: ~R$ 10-15/mês
```

---

## 🔐 Segurança

### 1. Autenticação Cloud Run
```bash
# Permitir acesso público (padrão já feito)
# Específico: só people com service account podem acessar
gcloud run services add-iam-policy-binding sipas-backend \
  --member=serviceAccount:seu-service-account@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/run.invoker \
  --region=southamerica-east1
```

### 2. CORS (já configurado)
```typescript
// Em main.ts
app.enableCors({
  origin: [
    'https://sipas-web.web.app',
    'https://sipas-web.firebaseapp.com',
  ],
  credentials: true,
});
```

### 3. Secrets Management
```bash
# Criar secret (melhor que .env)
echo -n "seu-secret-aqui" | gcloud secrets create supabase-key --data-file=-

# Usar em Cloud Run
gcloud run deploy sipas-backend \
  --set-env-vars SUPABASE_KEY=/run/secrets/supabase-key
```

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| **Service não inicia** | Verificar logs: `gcloud logging read ...` |
| **Erro 500** | Verificar Supabase connection no .env |
| **Timeout** | Aumentar timeout em Cloud Run settings |
| **CORS error** | Editar origins em `main.ts` e redeploy |
| **Ambiente não carregado** | Verificar `--set-env-vars` no deploy |

---

## 📊 Arquitetura Final

```
┌─────────────────────────────────────┐
│  GitHub (seu repositório)           │
│  - Clique em Deploy                 │
│  - Cloud Build dispara              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Google Cloud Build                 │
│  - Build Docker image               │
│  - Push para Container Registry     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Google Cloud Run                   │
│  (southamerica-east1 / São Paulo)   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  sipas-backend (container)  │   │
│  │  - NestJS 11                │   │
│  │  - Express server           │   │
│  │  - 512 MB memória           │   │
│  │  - Auto-scale 0-100         │   │
│  └─────────────────────────────┘   │
│                                     │
│  URL: https://sipas-backend-xxxx.  │
│       a.run.app                     │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
   Supabase        Frontend
   (PgSQL)         Firebase
                   Hosting
```

---

## ✨ Próximas Etapas

1. **Deploy Frontend**
   - Firebase Hosting
   - Mesmo projeto Google Cloud

2. **CI/CD Automático**
   - GitHub Actions
   - Deploy em cada push para `main`

3. **Monitoramento**
   - Error Reporting
   - Performance Monitoring
   - Alertas

4. **Custom Domain** (Opcional)
   - Mapear domínio próprio
   - SSL automático

---

**Status**: ✅ Pronto para deployment
**Data**: 23 Jan 2026
