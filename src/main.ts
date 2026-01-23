import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuração de CORS
  app.enableCors({
    origin: [
      'http://localhost:4200', // Development
      'http://localhost:3000', // Alternative dev
      'http://127.0.0.1:4200',
      process.env.FRONTEND_URL, // From environment
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('SIPAS API')
    .setDescription('API de autenticação e gestão de usuários')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT ?? 3000}`);
    console.log(
      `📚 Swagger is running on http://localhost:${process.env.PORT ?? 3000}/docs`,
    );
    console.log(
      `✅ Supabase connected: ${process.env.SUPABASE_URL ? 'YES' : 'NO'}`,
    );
  });
}
bootstrap().catch((error) => {
  console.error('Failed to bootstrap application:', error);
  process.exit(1);
});
