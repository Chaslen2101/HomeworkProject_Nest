import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
import { ExceptionResponseType } from '../Types/exception-response.types';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status: number = exception.getStatus();
    const exceptionResponse: ExceptionResponseType =
      exception.getResponse() as ExceptionResponseType;

    if (status == 400) {
      response.status(status).send({
        errorsMessages: exceptionResponse.message,
      });
    } else {
      response.status(status).send();
    }
  }
}
