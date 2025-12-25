import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicGuard } from '../../Common/Guards/basic.guard';
import {
  CreateUpdateQuestionInputDTO,
  UpdatePublishStatusDTO,
} from './InputDTOValidator/question-dto.validator';
import { CommandBus } from '@nestjs/cqrs';
import { CreateNewQuestionCommand } from '../Application/UseCases/create-new-question.usecase';
import {
  QuestionPagesType,
  QuizQuestionViewType,
} from './Types/quiz-game-view-model.types';
import { QuizQuestionQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/quiz-question.query-repository';
import { DeleteQuestionCommand } from '../Application/UseCases/delete-question.usecase';
import { UpdateQuestionCommand } from '../Application/UseCases/update-question.usecase';
import { UpdateQuestionPublishStatusCommand } from '../Application/UseCases/update-question-publish-status.usecase';
import type { InputQueryType } from '../../Common/Types/input-query.types';
import { QuestionQueryType } from './Types/quiz-game.input-query.types';
import { QuizGameQueryHelper } from './Helpers/quiz-game.query.helper';

@Controller('sa/quiz/questions')
export class QuizGameSaController {
  constructor(
    @Inject(CommandBus) private readonly commandBus: CommandBus,
    @Inject(QuizQuestionQueryRepository)
    private readonly questionQueryRepository: QuizQuestionQueryRepository,
  ) {}
  @Get()
  @UseGuards(BasicGuard)
  @HttpCode(200)
  async getAllQuestions(
    @Query() query: InputQueryType,
  ): Promise<QuestionPagesType> {
    const sanitizedQuery: QuestionQueryType =
      QuizGameQueryHelper.questionQuery(query);
    const result: QuestionPagesType =
      await this.questionQueryRepository.findAll(sanitizedQuery);
    console.log(result);
    return result;
  }
  @Post()
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createQuestion(
    @Body() newQuestionDto: CreateUpdateQuestionInputDTO,
  ): Promise<QuizQuestionViewType | null> {
    const newQuestionId: string = await this.commandBus.execute(
      new CreateNewQuestionCommand(newQuestionDto),
    );
    const newQuestion: QuizQuestionViewType | null =
      await this.questionQueryRepository.findQuestionById(newQuestionId);
    console.log(newQuestion);
    return newQuestion;
  }

  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async deleteQuestion(@Param('id') id: string): Promise<void> {
    const result: boolean = await this.commandBus.execute(
      new DeleteQuestionCommand(id),
    );
    if (!result) {
      throw new NotFoundException();
    }
    return;
  }

  @Put(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: CreateUpdateQuestionInputDTO,
  ): Promise<{ test: string }> {
    await this.commandBus.execute(
      new UpdateQuestionCommand(id, updateQuestionDto),
    );
    return { test: 'Put' };
  }

  @Put(':id/publish')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async updateQuestionPublishStatus(
    @Param('id') id: string,
    @Body() body: UpdatePublishStatusDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateQuestionPublishStatusCommand(body, id),
    );
    return;
  }
}
