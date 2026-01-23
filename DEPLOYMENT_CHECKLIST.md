# 📋 Checklist de Deployment - SIPAS Backend no Firebase

## ✅ Fase 1: Preparação do Backend (COMPLETO)

- [x] Dependências Firebase instaladas (firebase-functions, firebase-admin, express)
- [x] Arquivo `firebase.json` criado e configurado
- [x] Arquivo `src/main.firebase.ts` criado (entrada Cloud Functions)
- [x] Arquivo `.env.production` criado (template de variáveis)
- [x] Arquivo `.firebaserc` criado (config do CLI)
- [x] Build NestJS compilado em `dist/`
- [x] Scripts `npm run build` e `npm run build:firebase` funcionando
- [x] Validação com Firebase CLI (pode listar projetos)

## 🔵 Fase 2: Upgrade para Blaze (PRÓXIMO)

- [ ] **CRÍTICO**: Fazer upgrade para plano Blaze
  - Link: https://console.firebase.google.com/project/sipas-back/usage/details
  - Clique em "Upgrade to Blaze"
  - Adicione cartão de crédito
  - Aguarde confirmação (pode levar até 5 minutos)

**Após confirmar o upgrade:**
- [ ] Verificar que plano agora está "Blaze"
- [ ] Confirmar APIs habilitadas (cloudfunctions, cloudbuild, artifactregistry)

## 🟡 Fase 3: Configurar Credenciais (DEPOIS DO UPGRADE)

### Supabase Credentials
- [ ] Acessar https://supabase.com/dashboard
- [ ] Selecionar projeto SIPAS
- [ ] Copiar `Project URL` (Settings > API)
- [ ] Copiar `anon key` (Settings > API)
- [ ] Copiar `service_role key` (Settings > API)
- [ ] Preencher em `.env.production`:
  ```
  SUPABASE_URL=seu_url_aqui
  SUPABASE_KEY=sua_key_aqui
  SUPABASE_SERVICE_KEY=sua_service_key_aqui
  ```

### Firebase Credentials
- [ ] Acessar Firebase Console: https://console.firebase.google.com
- [ ] Selecionar projeto "sipas-back"
- [ ] Ir para Project Settings (⚙️ ícone)
- [ ] Abrir aba "Service Accounts"
- [ ] Clicar "Generate new private key"
- [ ] Arquivo JSON será baixado
- [ ] Copiar valores para `.env.production`:
  ```
  FIREBASE_PROJECT_ID=sipas-back
  FIREBASE_PRIVATE_KEY=valor_do_json
  FIREBASE_CLIENT_EMAIL=valor_do_json
  ```

## 🟠 Fase 4: Deploy (DEPOIS DAS CREDENCIAIS)

Executar na pasta `c:\Users\Admin\Documents\SIPAS\back`:

```powershell
# Passo 1: Recompilar (opcional se código mudou)
npm run build

# Passo 2: Deploy dry-run (teste sem fazer alterações)
firebase deploy --only functions --dry-run --project sipas-back

# Passo 3: Deploy real (quando estiver tudo certo)
firebase deploy --only functions --project sipas-back
```

- [ ] Build compilado com sucesso
- [ ] Dry-run passou sem erros
- [ ] Deploy real bem-sucedido
- [ ] Duas funções criadas:
  - [ ] `api` (manipulador principal)
  - [ ] `health` (health check)

## 🟢 Fase 5: Verificação & Testes (APÓS DEPLOY)

- [ ] Health check respondendo:
  ```
  https://southamerica-east1-sipas-back.cloudfunctions.net/health
  ```

- [ ] Swagger docs acessível:
  ```
  https://southamerica-east1-sipas-back.cloudfunctions.net/api/docs
  ```

- [ ] Endpoints respondendo (exemplo):
  ```
  https://southamerica-east1-sipas-back.cloudfunctions.net/api/persons
  ```

- [ ] Logs verificáveis (Firebase Console > Cloud Functions > Logs)

- [ ] Conecta com Supabase corretamente (verificar em logs)

## 📊 Informações do Projeto

| Item | Valor |
|------|-------|
| **Projeto Firebase** | sipas-back |
| **Região** | southamerica-east1 (São Paulo) |
| **Runtime** | Node.js 20 |
| **Memória por função** | 512 MB |
| **Timeout** | 60 segundos |
| **Min Instances** | 1 |
| **Plano** | Blaze (pay-as-you-go) |

## 🎯 URLs de Acesso

| Endpoint | URL |
|----------|-----|
| API Base | `https://southamerica-east1-sipas-back.cloudfunctions.net/api` |
| Swagger UI | `https://southamerica-east1-sipas-back.cloudfunctions.net/api/docs` |
| Health Check | `https://southamerica-east1-sipas-back.cloudfunctions.net/health` |
| Pessoas | `https://southamerica-east1-sipas-back.cloudfunctions.net/api/persons` |

## 💡 Dicas Importantes

1. **Cold Start**: Primeira requisição demora mais (até 5s). Minuto Instance=1 ajuda.
2. **Logs**: Ver em https://console.firebase.google.com/project/sipas-back > Cloud Functions > Logs
3. **Monitoramento**: Setup do Firebase Monitoring para alertas
4. **Custos**: Acompanhar em Firebase Console > Usage para não surpresas

## ❓ Troubleshooting

**Q: Erro "Must be on Blaze plan"**
A: Complete Fase 2 primeiro

**Q: Erro de conexão Supabase**
A: Verifique credenciais em .env.production

**Q: Cold start muito lento**
A: Aumente minInstances para 3-5 ou aumentar memória para 1024MB

**Q: Problema com CORS**
A: Verificar origins em `src/main.firebase.ts`

---

**Próximo passo:** Fazer upgrade para Blaze em ⬆️
