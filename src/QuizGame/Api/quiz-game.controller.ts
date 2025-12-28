import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../Common/Guards/jwt.guard';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectionQuizGameCommand } from '../Application/UseCases/connection.usecase';
import { AccessTokenPayloadType } from '../../Common/Types/auth-payloads.types';
import { QuizPairQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/quiz-pair.query-repository';
import {
  QuizPairViewType,
  QuizAnswerViewType,
  QuizMyStatisticType,
  QuizPairPagesType,
} from './Types/quiz-game-view-model.types';
import { SetAnswerInputDTO } from './InputDTOValidator/quiz-pair-dto.validator';
import { SetAnswerForQuestionCommand } from '../Application/UseCases/set-answer-for-question.usecase';
import { QuizAnswerQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/quiz-answer.query-repository';
import { isUUID } from 'class-validator';
import type { InputQueryType } from '../../Common/Types/input-query.types';
import { QuizGameQueryHelper } from './Helpers/quiz-game.query.helper';
import { QuizPairQueryType } from './Types/quiz-game.input-query.types';

@Controller('pair-game-quiz')
export class QuizGameController {
  constructor(
    @Inject(CommandBus) private readonly commandBus: CommandBus,
    @Inject(QuizPairQueryRepository)
    private readonly quizPairQueryRepository: QuizPairQueryRepository,
    @Inject(QuizAnswerQueryRepository)
    private readonly quizAnswerQueryRepository: QuizAnswerQueryRepository,
  ) {}
  @Post('pairs/connection')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async connection(@Req() req: Express.Request) {
    const pairId: string = await this.commandBus.execute(
      new ConnectionQuizGameCommand(req.user as AccessTokenPayloadType),
    );
    const result: QuizPairViewType | null =
      await this.quizPairQueryRepository.findPairById(pairId);
    return result;
  }

  @Get('pairs/my-current')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async returnCurrentGame(
    @Req() req: Express.Request,
  ): Promise<QuizPairViewType> {
    const currentGame: QuizPairViewType | null =
      await this.quizPairQueryRepository.findActivePairByPlayerId(
        req.user as AccessTokenPayloadType,
      );
    if (!currentGame) {
      throw new HttpException('Pair not found', HttpStatus.NOT_FOUND);
    }
    return currentGame;
  }

  @Post('pairs/my-current/answers')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async setAnswer(
    @Req() req: Express.Request,
    @Body() dto: SetAnswerInputDTO,
  ): Promise<QuizAnswerViewType | null> {
    const answerId: string = await this.commandBus.execute(
      new SetAnswerForQuestionCommand(
        req.user as AccessTokenPayloadType,
        dto.answer,
      ),
    );

    const result: QuizAnswerViewType | null =
      await this.quizAnswerQueryRepository.findAnswerById(answerId);
    return result;
  }

  @Get('users/my-statistic')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async getStatistic(
    @Req() req: Express.Request,
  ): Promise<QuizMyStatisticType> {
    const userInfo: AccessTokenPayloadType = req.user as AccessTokenPayloadType;
    const result: QuizMyStatisticType =
      await this.quizPairQueryRepository.getStatisctic(userInfo.sub);
    return result;
  }

  @Get('pairs/my')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async getAllMyGames(
    @Query() query: InputQueryType,
    @Req() req: Express.Request,
  ): Promise<QuizPairPagesType> {
    const sanitizedQuery: QuizPairQueryType =
      QuizGameQueryHelper.pairQuery(query);
    const result: QuizPairPagesType =
      await this.quizPairQueryRepository.findPairsByPlayerId(
        req.user as AccessTokenPayloadType,
        sanitizedQuery,
      );
    return result;
  }

  @Get('pairs/:id')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async returnPairById(
    @Req() req: Express.Request,
    @Param('id') pairId: string,
  ): Promise<QuizPairViewType> {
    if (!isUUID(pairId)) {
      throw new HttpException('Invalid UUID', HttpStatus.BAD_REQUEST);
    }
    const neededPair: QuizPairViewType | null =
      await this.quizPairQueryRepository.findPairById(pairId);
    if (!neededPair) {
      throw new HttpException('Pair not found', HttpStatus.NOT_FOUND);
    }
    const userInfo: AccessTokenPayloadType = req.user as AccessTokenPayloadType;
    if (
      neededPair.firstPlayerProgress.player.id != userInfo.sub &&
      (!neededPair.secondPlayerProgress ||
        neededPair.secondPlayerProgress.player.id != userInfo.sub)
    ) {
      throw new HttpException(
        'User not participant of the pair',
        HttpStatus.FORBIDDEN,
      );
    }
    return neededPair;
  }
}
