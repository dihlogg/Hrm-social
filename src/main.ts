import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'https://hrm-tool.vercel.app', 'https://ltdhrm.me', 'https://www.ltdhrm.me'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const config = new DocumentBuilder()
    .setTitle('HRM SOCIAL API')
    .setDescription('HRM Management API')
    .setVersion('1.0')
    .addTag('Hrm Tool')
    .addBearerAuth()
    .addServer('/hrm-social')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
