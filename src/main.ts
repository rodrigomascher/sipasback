import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
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

  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Apply global JWT auth guard
  app.useGlobalGuards(app.get(JwtAuthGuard));

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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SIPAS API')
    .setDescription(
      'Sistema Integrado de Prontuário e Assistência Social - API Documentation',
    )
    .setVersion('1.0.0')
    .setContact(
      'SIPAS Team',
      'https://github.com/sipas',
      'support@sipas.local',
    )
    .setLicense(
      'UNLICENSED',
      'https://github.com/sipas',
    )
    .addServer('http://localhost:3000', 'Development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'access-token',
    )
    .addTag('auth', 'Authentication operations')
    .addTag('users', 'User management operations')
    .addTag('units', 'Unit management operations')
    .addTag('genders', 'Gender management operations')
    .addTag('employees', 'Employee management operations')
    .addTag('persons', 'Person management operations')
    .addTag('departments', 'Department management operations')
    .addTag('roles', 'Role management operations')
    .addTag('relationship-degrees', 'Relationship degree management operations')
    .addTag('sexual-orientations', 'Sexual orientation management operations')
    .addTag('gender-identities', 'Gender identity management operations')
    .addTag('family-composition', 'Family composition management operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SIPAS API Documentation',
  });

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT ?? 3000}`);
    console.log(
      `📚 Swagger is running on http://localhost:${process.env.PORT ?? 3000}/api/docs`,
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
