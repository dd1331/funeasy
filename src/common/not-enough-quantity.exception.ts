import { HttpException, HttpStatus } from '@nestjs/common';
import { WRONG_CODE } from './constants';

export class NotEnoughQuantityException extends HttpException {
  constructor() {
    super(
      { message: 'WRONG_ANSWER', code: WRONG_CODE, data: null },
      HttpStatus.BAD_REQUEST,
    );
  }
}
