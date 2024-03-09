import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';

export class SolveQuestionDto extends PartialType(CreateQuestionDto) {
  answer?: string;
}
