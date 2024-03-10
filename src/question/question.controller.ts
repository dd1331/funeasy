import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ReqUser } from '../user/user.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SolveQuestionDto } from './dto/solve-question.dto';
import { QuestionService } from './question.service';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.create(createQuestionDto);
  }

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
    const data = await this.questionService.findAll({ userId });

    if (data.length) return data;

    return { data, code: 1 };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: SolveQuestionDto) {
    return this.questionService.update(+id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionService.remove(+id);
  }
}
