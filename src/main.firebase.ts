import * as functions from 'firebase-functions';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';

// Configuração da região
const region = 'southamerica-east1'; // São Paulo

// Cache para reutilizar a aplicação NestJS entre invocações
let cachedApp: any;

/**
 * Inicializa a aplicação NestJS uma única vez
 * Subsequentes invocações reutilizam a mesma instância (cold start otimizado)
 */
async function initializeNestApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule);

  // CORS para ambientes locais e produção
  app.enableCors({
    origin: [
      'localhost:3000',
      'localhost:4200',
      'localhost:5000',
      /https:\/\/(www\.)?sipas-web\.web\.app$/,
      /https:\/\/(www\.)?sipas-web\.firebaseapp\.com$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('SIPAS API')
    .setDescription('API de Gestão do Sistema SIPAS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Prefixo global para API
  app.setGlobalPrefix('api');

  // Inicializar sem listen (Cloud Functions cuida disso)
  await app.init();

  cachedApp = app;
  return app;
}

/**
 * Função principal HTTP handler para toda a API
 * Exporta para Firebase Cloud Functions como: api
 */
export const api = functions
  .region(region)
  .https.onRequest(async (req: express.Request, res: express.Response) => {
    try {
      const app = await initializeNestApp();
      app.getHttpAdapter().getInstance()(req, res);
    } catch (error) {
      console.error('Erro na inicialização da app:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

/**
 * Health check endpoint para monitoramento
 * Exporta para Firebase Cloud Functions como: health
 */
export const health = functions
  .region(region)
  .https.onRequest((req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      region,
      environment: process.env.NODE_ENV || 'production',
    });
  });
