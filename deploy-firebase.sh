#!/bin/bash
# SIPAS Firebase Backend - Quick Deploy Script
# Execute este script após fazer upgrade para Blaze

set -e

echo "🚀 SIPAS Backend Firebase Deployment Script"
echo "=============================================="
echo ""

# Verificar se Firebase CLI está disponível
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não está instalado"
    echo "Instale com: npm install -g firebase-tools"
    exit 1
fi

# Verificar se em diretório correto
if [ ! -f "firebase.json" ]; then
    echo "❌ Arquivo firebase.json não encontrado"
    echo "Execute este script a partir de: c:\Users\Admin\Documents\SIPAS\back"
    exit 1
fi

echo "✅ Firebase CLI encontrado"
echo ""

# Passo 1: Verificar autenticação
echo "📋 Passo 1: Verificar autenticação Firebase"
firebase projects:list

echo ""
echo "✅ Autenticação confirmada"
echo ""

# Passo 2: Build
echo "📋 Passo 2: Compilar backend"
npm run build

echo ""
echo "✅ Build concluído"
echo ""

# Passo 3: Verificar arquivo de ambiente
echo "📋 Passo 3: Verificar configuração de ambiente"
if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production não encontrado"
    echo "Crie o arquivo com as credenciais do Supabase"
    exit 1
fi

echo "✅ .env.production encontrado"
echo ""

# Passo 4: Deploy
echo "📋 Passo 4: Fazer Deploy para Firebase"
echo "Projeto: sipas-back"
echo "Funções: api, health"
echo ""

read -p "Deseja prosseguir com o deploy? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    firebase deploy --only functions --project sipas-back
    
    echo ""
    echo "✅ Deploy concluído com sucesso!"
    echo ""
    echo "📍 URLs de acesso:"
    echo "  - API: https://southamerica-east1-sipas-back.cloudfunctions.net/api"
    echo "  - Health: https://southamerica-east1-sipas-back.cloudfunctions.net/health"
    echo "  - Swagger: https://southamerica-east1-sipas-back.cloudfunctions.net/api/docs"
else
    echo "Deploy cancelado"
    exit 1
fi
