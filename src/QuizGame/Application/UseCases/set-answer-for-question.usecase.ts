import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AccessTokenPayloadType } from '../../../Common/Types/auth-payloads.types';
import { Inject } from '@nestjs/common';
import { QuizPairRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-pair.repository';
import { QuizAnswer } from '../../Domain/quiz-answer.entity';
import { DomainException } from '../../../Common/Domain/Exceptions/domain-exceptions';
import { GameDataType } from '../../Domain/Types/game-data.types';
import { QuizAnswerRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-answer.repository';
import { QuizPair } from '../../Domain/quiz-pair.entity';
import { FinishedGameEvent } from './finish-game.usecase';
import { IUnitOfWork } from '../Interfaces/unit-of-work.interface';

export class SetAnswerForQuestionCommand {
  constructor(
    public userInfo: AccessTokenPayloadType,
    public answer: string,
  ) {}
}

@CommandHandler(SetAnswerForQuestionCommand)
export class SetAnswerForQuestionUseCase
  implements ICommandHandler<SetAnswerForQuestionCommand, string>
{
  constructor(
    @Inject(QuizPairRepository) private quizPairRepository: QuizPairRepository,
    @Inject(QuizAnswerRepository)
    private quizAnswerRepository: QuizAnswerRepository,
    @Inject(EventBus) private readonly eventBus: EventBus,
    @Inject(IUnitOfWork) private readonly unitOfWork: IUnitOfWork,
  ) {}
  async execute(dto: SetAnswerForQuestionCommand): Promise<string> {
    return await this.unitOfWork.runInTransaction(async (manager) => {
      const gameData: GameDataType | null =
        await this.quizPairRepository.getActiveGameDataByUserId(
          dto.userInfo.sub,
          manager,
        );
      if (!gameData) {
        throw new DomainException('User is not in active pair', 403);
      }
      const newAnswer: QuizAnswer = QuizAnswer.createNew(
        gameData,
        dto.answer,
        dto.userInfo.sub,
      );
      await this.quizAnswerRepository.createNewAnswer(newAnswer, manager);
      gameData.answers.push(newAnswer);
      gameData.pair.countScore(gameData.answers);
      const isFinished: void | QuizPair = gameData.pair.tryFinishGame(
        gameData.answers,
      );
      await this.quizPairRepository.update(gameData.pair, manager);

      if (isFinished) {
        await this.eventBus.publish(
          new FinishedGameEvent(gameData.pair, manager),
        );
      }
      return newAnswer.id;
    });
  }
}
