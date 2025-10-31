import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const request: Request = ctx.getRequest<Request>();

    if (exception.code === 400) {
      response.status(400).json({
        errorsMessages: [
          { message: exception.message, field: exception.field },
        ],
      });
    } else if (exception.code === 500) {
      response
        .status(exception.code)
        .json({ Error: exception.message, Path: request.url });
    } else {
      response.status(exception.code).json();
    }
  }
}
