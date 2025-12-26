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
} from './Types/quiz-game-view-model.types';
import { SetAnswerInputDTO } from './InputDTOValidator/quiz-pair-dto.validator';
import { SetAnswerForQuestionCommand } from '../Application/UseCases/set-answer-for-question.usecase';
import { QuizAnswerQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/quiz-answer.query-repository';
import { isUUID } from 'class-validator';

@Controller('pair-game-quiz/pairs')
export class QuizGameController {
  constructor(
    @Inject(CommandBus) private readonly commandBus: CommandBus,
    @Inject(QuizPairQueryRepository)
    private readonly quizPairQueryRepository: QuizPairQueryRepository,
    @Inject(QuizAnswerQueryRepository)
    private readonly quizAnswerQueryRepository: QuizAnswerQueryRepository,
  ) {}
  @Post('connection')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async connection(@Req() req: Express.Request) {
    const pairId: string = await this.commandBus.execute(
      new ConnectionQuizGameCommand(req.user as AccessTokenPayloadType),
    );
    const result: QuizPairViewType | null =
      await this.quizPairQueryRepository.findPairById(pairId);
    console.log(result);
    return result;
  }

  @Get('my-current')
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
    console.log(currentGame);
    return currentGame;
  }

  @Get(':id')
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
      neededPair.firstPlayerProgress.player.id != userInfo.sub ||
      (neededPair.secondPlayerProgress &&
        neededPair.secondPlayerProgress.player.id != userInfo.sub)
    ) {
      throw new HttpException(
        'User not participant of the pair',
        HttpStatus.FORBIDDEN,
      );
    }
    console.log(neededPair);
    return neededPair;
  }

  @Post('my-current/answers')
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
    console.log(result);
    return result;
  }
}
