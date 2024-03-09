import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly defaultCode: number = 0,
    private readonly defaultMessage: string = 'Success',
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const code =
          typeof data === 'object' && data.hasOwnProperty('code')
            ? data.code
            : this.defaultCode;
        const message =
          typeof data === 'object' && data.hasOwnProperty('message')
            ? data.message
            : this.defaultMessage;

        return {
          code: code,
          message: message,
          data,
        };
      }),
    );
  }
}
