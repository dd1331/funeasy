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
} from '@nestjs/common';
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
  @Post(':questionId')
  solve(@Param('questionId') questionId, @Body() dto: SolveQuestionDto) {
    return this.questionService.solve(questionId, dto);
  }

  @Get()
  async findAll() {
    const data = await this.questionService.findAll();

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
