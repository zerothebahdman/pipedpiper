import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as requestIp from 'request-ip';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // CORS is enabled
  const app = await NestFactory.create(AppModule, { cors: true });
  const config = app.get(ConfigService);
  // Request Validation
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use(requestIp.mw());
  app.use(cookieParser(config.getOrThrow<string>('jwt_secret')));

  // Helmet Middleware against known security vulnerabilities
  app.use(helmet());

  // Swagger API Documentation
  const options = new DocumentBuilder()
    .setTitle('Pipedpiper')
    .setDescription('A simple Pipedpiper')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.get<number>('port') || 3000, '127.0.0.1', () => {
    Logger.log(
      `Server 🚀 is running on on port ${config.get<number>('port') || 3000}`,
    );
  });
}

bootstrap();
