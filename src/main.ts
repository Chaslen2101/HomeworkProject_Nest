import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  HttpException,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { HttpExceptionsFilter } from './Core/Exceptions/Filters/http-exception.filter';
import { DomainExceptionFilter } from './Core/Exceptions/Filters/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]): HttpException => {
        const result = errors.map((error: ValidationError) => {
          const keyName: string = Object.keys(error.constraints!)[0];
          return {
            message: error.constraints![keyName],
            field: error.property,
          };
        });
        return new BadRequestException(result);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionsFilter(), new DomainExceptionFilter());
  await app.listen(5005);
}
bootstrap();
