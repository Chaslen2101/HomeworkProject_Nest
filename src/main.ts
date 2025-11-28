import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  HttpException,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { HttpExceptionsFilter } from './Api/Filters/http-exception.filter';
import { DomainExceptionFilter } from './Api/Filters/domain-exception.filter';
import cookieParser from 'cookie-parser';
import fastifyCookie from '@fastify/cookie';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.register(fastifyCookie);
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
  app.use(cookieParser());
  await app.listen(5005);
}
bootstrap();
