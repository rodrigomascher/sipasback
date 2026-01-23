# 🚀 Quick Start - Google Cloud Setup

## Passo 1️⃣: Criar Conta Google Cloud (5 minutos)

1. Acesse: **https://cloud.google.com/**

2. Clique em **"Get started for free"**

3. Faça login com sua conta Google (ou crie uma)

4. Complete o formulário:
   - Name: Seu nome
   - Email: seu-email@gmail.com
   - Country: Brazil
   - Aceite os termos

5. **Adicionar cartão de crédito** (seguro!)
   - Google dá $300 grátis
   - Só cobra se passar $300
   - Para SIPAS: Nunca vai passar

6. Clique "Ativar conta"

✅ **Pronto! Você tem $300 de crédito grátis**

---

## Passo 2️⃣: Instalar Google Cloud SDK (10 minutos)

### Windows (Seu sistema)

1. Download: **https://cloud.google.com/sdk/docs/install-sdk**

2. Clique em **"Windows"**

3. Baixe o instalador (`.exe`)

4. Execute e instale (clique Next > Next > Finish)

5. Abra **PowerShell** como Administrador

6. Execute:
   ```powershell
   gcloud --version
   ```
   Deve mostrar algo como: `Google Cloud SDK 123.0.0`

✅ **SDK instalado!**

---

## Passo 3️⃣: Login e Setup (5 minutos)

Na mesma janela PowerShell, execute:

```powershell
# Fazer login
gcloud init

# Vai abrir navegador - clique em seu email
# Autorize o acesso (sim, é seguro)
```

Perguntas que vai fazer:
```
? Do you want to configure a default Compute Region and Zone? 
→ N

? Which Google Cloud project would you like to use? 
→ Escolha "sipas-back" (já deve estar listado)

? Would you like to configure a default Compute Region and Zone? 
→ N
```

✅ **Conectado!**

Verifique:
```powershell
gcloud config list
```

Deve mostrar:
```
[core]
account = seu-email@gmail.com
project = sipas-back
```

---

## Passo 4️⃣: Ativar APIs Necessárias (3 minutos)

```powershell
# Cloud Run API
gcloud services enable run.googleapis.com

# Cloud Build API (para deploy automático)
gcloud services enable cloudbuild.googleapis.com

# Artifact Registry API
gcloud services enable artifactregistry.googleapis.com
```

✅ **APIs ativadas!**

---

## Passo 5️⃣: Preparar Credenciais Supabase (2 minutos)

1. Acesse: **https://supabase.com/dashboard**

2. Clique no seu projeto SIPAS

3. Vá para **Settings > API**

4. Copie e guarde:
   - **Project URL** (exemplo: `https://xxxx.supabase.co`)
   - **anon public key** (começa com `eyJ...`)
   - **service_role key** (maior, privada)

Arquivo: `c:\Users\Admin\Documents\SIPAS\back\.env.cloud-run`

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

✅ **Credenciais prontas!**

---

## Passo 6️⃣: Deploy em 30 segundos! 🚀

Na pasta `back`:

```powershell
cd c:\Users\Admin\Documents\SIPAS\back

# Build e deploy automático
gcloud run deploy sipas-backend `
  --source . `
  --region southamerica-east1 `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1
```

Depois, configure as variáveis de ambiente (IMPORTANTE!):

```powershell
gcloud run deploy sipas-backend `
  --region southamerica-east1 `
  --update-env-vars="SUPABASE_URL=https://omlwgallgulduobimxko.supabase.co,SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbHdnYWxsZ3VsZHVvYmlteGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk2OTkyMiwiZXhwIjoyMDg0NTQ1OTIyfQ.n3GgA5rq5DBGnTd48CYrAJ18FbhGuwgOCZuGMqAHxsQ,NODE_ENV=production"
```

**Aguarde 5-10 minutos...**

Quando terminar, você verá:
```
✓ Service [sipas-backend] revision [sipas-backend-xxxxx-gwv] has been deployed
✓ Serving 100 percent of traffic
Service URL: https://sipas-backend-797203546871.southamerica-east1.run.app
```

✅ **BACKEND ONLINE!**

---

## Passo 7️⃣: Testar Deployment (2 minutos)

A API está rodando em: **https://sipas-backend-797203546871.southamerica-east1.run.app**

No navegador, acesse a documentação interativa:
```
https://sipas-backend-797203546871.southamerica-east1.run.app/api/docs
```

Deve aparecer a interface **Swagger** com toda a API!

Você pode também testar endpoints específicos, ex:
```powershell
# Listar genders
Invoke-WebRequest -Uri "https://sipas-backend-797203546871.southamerica-east1.run.app/api/genders" `
  -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} `
  -UseBasicParsing | ConvertFrom-Json
```

---

## 🎯 Resumo Rápido

| Passo | O que fazer | Tempo |
|-------|------------|-------|
| 1 | Criar conta Google Cloud | 5 min |
| 2 | Instalar Google Cloud SDK | 10 min |
| 3 | Login com `gcloud init` | 5 min |
| 4 | Ativar APIs | 3 min |
| 5 | Copiar credenciais Supabase | 2 min |
| 6 | Deploy com `gcloud run deploy` | 10 min |
| 7 | Testar endpoints | 2 min |
| **TOTAL** | | **~40 minutos** |

---

## ✅ Status de Deployment (23/01/2026)

- ✅ **Conta Google Cloud**: Ativa com $300 de crédito
- ✅ **Google Cloud SDK**: Instalado e configurado
- ✅ **APIs Ativadas**: Cloud Run, Cloud Build, Artifact Registry
- ✅ **Backend Deployado**: https://sipas-backend-797203546871.southamerica-east1.run.app
- ✅ **Documentação Swagger**: https://sipas-backend-797203546871.southamerica-east1.run.app/api/docs

### Comandos Úteis

```powershell
# Ver status do serviço
gcloud run describe sipas-backend --region southamerica-east1

# Ver logs em tempo real
gcloud run logs read sipas-backend --limit 50 --region southamerica-east1

# Redeploy (se fez mudanças no código)
gcloud run deploy sipas-backend --source . --region southamerica-east1 `
  --allow-unauthenticated --memory 512Mi --cpu 1

# Listar todas as revisões
gcloud run revisions list --service=sipas-backend --region=southamerica-east1
```

---

✅ `.env.production` **NÃO** é commitado (está em `.gitignore`)
✅ Cloud Run faz HTTPS automático
✅ Supabase isolado por chave
✅ Free tier = sem custo

---

## ❓ Dúvidas Durante Setup?

### Problema: "gcloud command not found"
→ Reinicie PowerShell após instalar SDK

### Problema: "Project 'sipas-back' not found"
→ Crie o projeto no Console: https://console.cloud.google.com/

### Problema: "Docker build failed"
→ Pode levar tempo, aguarde mais

### Problema: "Service URL takes forever"
→ Tá normal, cold start demora 5-10 min

---

**Próximo passo:** Siga os passos acima!
**Depois:** Teste a URL gerada no navegador
**Depois disso:** Frontend em Firebase Hosting

Boa sorte! 🚀
