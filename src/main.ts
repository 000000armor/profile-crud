import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('User Profile CRUD API')
    .setDescription('REST API for user profiles')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const openApiModule = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, openApiModule);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
