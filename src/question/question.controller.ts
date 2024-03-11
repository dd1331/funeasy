import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { WRONG_CODE } from '../common/constants';
import { ReqUser } from '../user/user.decorator';
import { SolveQuestionDto } from './dto/solve-question.dto';
import { QuestionService } from './question.service';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post(':questionId')
  solve(
    @ReqUser() { userId },
    @Param('questionId') questionId,
    @Body() dto: SolveQuestionDto,
  ) {
    return this.questionService.solve({ ...dto, userId, questionId });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@ReqUser() { userId }) {
    const data = await this.questionService.getQuestions({ userId });

    if (data.length) return data;

    return { data, code: WRONG_CODE };
  }
}
