import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { OK_CODE } from './constants';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.OK;
    let code = OK_CODE;
    let message = 'Internal Server Error';
    let data = null;

    if (typeof exception.getResponse === 'function') {
      const errorResponse = exception.getResponse();
      if (errorResponse instanceof Object) {
        if (
          'code' in errorResponse &&
          typeof errorResponse['code'] === 'number'
        ) {
          code = errorResponse['code'];
        }
        if (
          'message' in errorResponse &&
          typeof errorResponse['message'] === 'string'
        ) {
          message = errorResponse['message'];
        }
        data = errorResponse['data'] || null;
      }
    }

    response.status(status).json({ code, message, data });
  }
}
