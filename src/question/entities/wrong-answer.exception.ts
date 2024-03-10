import { HttpException, HttpStatus } from '@nestjs/common';
import { WRONG_CODE } from '../../common/constants';

export class WrongAnsewrException extends HttpException {
  constructor() {
    super(
      { message: 'WRONG_ANSWER', code: WRONG_CODE, data: null },
      HttpStatus.BAD_REQUEST,
    );
  }
}
