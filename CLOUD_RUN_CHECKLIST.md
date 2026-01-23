# ✅ Google Cloud Run - Deployment Checklist

## Fase 1: Preparação Local ✅

- [x] Dockerfile criado
- [x] .dockerignore criado
- [x] package.json atualizado com scripts Docker
- [x] .env.cloud-run criado (template)
- [x] NestJS rodando localmente: `npm run start:dev`
- [x] Build testado: `npm run build`

## Fase 2: Setup Google Cloud (PRÓXIMO)

### Google Cloud Account
- [ ] Criar conta em https://cloud.google.com/
- [ ] Ativar Free Trial ($300 crédito)
- [ ] Criar projeto chamado "sipas-back"
- [ ] Ativar Cloud Run API
- [ ] Ativar Cloud Build API (se usar CI/CD)
- [ ] Ativar Artifact Registry API

### Google Cloud SDK
- [ ] Instalar Google Cloud SDK (https://cloud.google.com/sdk)
- [ ] Executar: `gcloud init`
- [ ] Executar: `gcloud auth login`
- [ ] Verificar: `gcloud config list`
- [ ] Selecionar projeto: `gcloud config set project sipas-back`

### Docker (Opcional - Cloud Build faz automaticamente)
- [ ] Instalar Docker Desktop
- [ ] Verificar: `docker --version`

## Fase 3: Configurar Credenciais

### Supabase
- [ ] Acessar https://supabase.com/dashboard
- [ ] Copiar Project URL (Settings > API)
- [ ] Copiar anon public key
- [ ] Copiar service_role key
- [ ] Preencher em `.env.cloud-run`:
  ```
  SUPABASE_URL=seu_url
  SUPABASE_KEY=sua_key
  SUPABASE_SERVICE_KEY=sua_service_key
  ```

### Preparar .env.production
- [ ] Copiar `.env.cloud-run` para `.env.production`
- [ ] Editar com valores reais do Supabase
- [ ] **NÃO** commitar `.env.production`
- [ ] Verificar: `.env.production` está em `.gitignore`

## Fase 4: Testar Localmente (Opcional)

```bash
# No terminal, na pasta back/

# Build imagem local
npm run docker:build

# Rodar container
npm run docker:run

# Testar
curl http://localhost:3000/health
curl http://localhost:3000/api/docs
```

- [ ] Build Docker bem-sucedido
- [ ] Container rodando sem erros
- [ ] Endpoints respondendo localmente

## Fase 5: Deploy para Cloud Run

### Opção A: Google Cloud Console (Recomendado para primeira vez)

```bash
# 1. Abrir Google Cloud Console
# https://console.cloud.google.com/

# 2. Selecionar projeto "sipas-back"

# 3. Ir para Cloud Run > Create Service

# 4. Preencher:
```

Checklist do formulário:
- [ ] Service name: `sipas-backend`
- [ ] Region: `southamerica-east1`
- [ ] Authentication: Allow unauthenticated invocations
- [ ] Container image: Use Cloud Build
  - [ ] Source: GitHub
  - [ ] Conectar repositório
  - [ ] Branch: main
  - [ ] Dockerfile path: `back/Dockerfile`
- [ ] CPU allocation: 1
- [ ] Memory: 512 MB
- [ ] Timeout: 3600 segundos

- [ ] Environment variables:
  - [ ] NODE_ENV: production
  - [ ] PORT: 3000
  - [ ] SUPABASE_URL: (do Supabase)
  - [ ] SUPABASE_KEY: (do Supabase)
  - [ ] SUPABASE_SERVICE_KEY: (do Supabase)
  - [ ] CORS_ORIGIN: `https://sipas-web.web.app,https://sipas-web.firebaseapp.com`
  - [ ] API_URL: (deixar em branco por enquanto)
  - [ ] LOG_LEVEL: info

- [ ] Clique "Create"
- [ ] Aguardar deploy (~5-10 minutos)

### Opção B: Google Cloud CLI

```bash
cd c:\Users\Admin\Documents\SIPAS\back

gcloud run deploy sipas-backend \
  --source . \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated
```

- [ ] Executar comando
- [ ] Confirmar quando solicitado
- [ ] Aguardar conclusão

## Fase 6: Verificar Deployment ✅

- [ ] Acessar Cloud Run no Console
- [ ] Encontrar serviço "sipas-backend"
- [ ] Status está "Ready"
- [ ] Copiar "Service URL"
  ```
  Exemplo: https://sipas-backend-xxxxx-uc.a.run.app
  ```

### Testar Endpoints

- [ ] Health check:
  ```bash
  curl https://sipas-backend-xxxxx-uc.a.run.app/health
  ```
  Response:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-01-23T...",
    "environment": "production"
  }
  ```

- [ ] Swagger Docs:
  ```
  https://sipas-backend-xxxxx-uc.a.run.app/api/docs
  ```
  Deve carregar interface Swagger

- [ ] API endpoints (exemplo):
  ```bash
  curl https://sipas-backend-xxxxx-uc.a.run.app/api/persons
  ```
  Deve retornar dados ou erro de autenticação (não 404)

### Verificar Logs

```bash
gcloud run services describe sipas-backend --region southamerica-east1

# Ver logs em tempo real
gcloud logs read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=sipas-backend" \
  --limit 100 \
  --follow
```

- [ ] Logs mostrando requisições bem-sucedidas
- [ ] Nenhum erro crítico nos logs

## Fase 7: Atualizar URL do Backend (Importante!)

Agora que temos a URL real:

```bash
# Atualizar variável de ambiente
gcloud run services update sipas-backend \
  --set-env-vars API_URL="https://sipas-backend-xxxxx-uc.a.run.app/api" \
  --region southamerica-east1
```

- [ ] Redeploy concluído
- [ ] URL atualizada em `API_URL`

## Fase 8: Conectar Frontend (Próximo)

### Atualizar Frontend

Frontend precisa saber a URL do backend:

```typescript
// environment.prod.ts
export const environment = {
  apiUrl: 'https://sipas-backend-xxxxx-uc.a.run.app/api',
  production: true,
};
```

- [ ] Frontend aponta para URL correta
- [ ] CORS configurado (já está em main.ts)
- [ ] Build frontend com `npm run build`

### Deploy Frontend no Firebase Hosting

- [ ] Executar: `firebase deploy --only hosting --project sipas-web`
- [ ] Frontend e Backend se comunicando
- [ ] Testar funcionalidades completas

## Fase 9: Monitoramento (Opcional)

### Cloud Run Monitoring
- [ ] Abrir Cloud Run > sipas-backend
- [ ] Abrir aba "Metrics"
- [ ] Monitorar:
  - [ ] Invocations/segundo
  - [ ] Execution time
  - [ ] Memory usage
  - [ ] Error rates

### Logs & Alerts
- [ ] Configurar erro alerts
- [ ] Monitorar cold starts

## 📊 Informações do Deployment

| Item | Valor |
|------|-------|
| **Projeto** | sipas-back |
| **Serviço** | sipas-backend |
| **Region** | southamerica-east1 |
| **Platform** | Google Cloud Run |
| **CPU** | 1 |
| **Memory** | 512 MB |
| **Timeout** | 3600s |
| **Container** | NestJS + Express |
| **Database** | Supabase (PostgreSQL) |

## 🎯 URLs Finais

```
Health Check: https://sipas-backend-xxxxx-uc.a.run.app/health
Swagger Docs: https://sipas-backend-xxxxx-uc.a.run.app/api/docs
API Base:     https://sipas-backend-xxxxx-uc.a.run.app/api
Pessoas:      https://sipas-backend-xxxxx-uc.a.run.app/api/persons
```

## 💰 Costos

Com Free Tier:
- ✅ Primeiras 2M requisições/mês → GRÁTIS
- ✅ 360.000 GB-segundos → GRÁTIS
- ✅ Perfeitopara dev/pequeno uso

## ❓ Troubleshooting

| Problema | Solução |
|----------|---------|
| **Deploy falha** | Verificar logs: `gcloud logs read` |
| **Erro 500** | Verificar Supabase credentials em env vars |
| **CORS error** | Editar `main.ts` e redeploy |
| **Timeout** | Aumentar timeout em Cloud Run settings |
| **"Pod did not start"** | Verificar porta (deve ser 3000) |

## ✨ Próximos Passos

1. **CI/CD Automático**
   - [ ] GitHub Actions para deploy em cada push

2. **Frontend Deployment**
   - [ ] Deploy frontend em Firebase Hosting
   - [ ] Apontar para URL do Cloud Run

3. **Custom Domain** (Opcional)
   - [ ] Mapear domínio próprio
   - [ ] SSL automático

4. **Monitoramento em Produção**
   - [ ] Setup alertas de erro
   - [ ] Monitor de performance

---

**Status**: 🟡 Pronto para começar Phase 2 (Google Cloud Setup)
**Data**: 23 Jan 2026
**Próximo**: Criar conta Google Cloud
