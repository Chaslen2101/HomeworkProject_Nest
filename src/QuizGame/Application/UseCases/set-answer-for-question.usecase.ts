import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccessTokenPayloadType } from '../../../Common/Types/auth-payloads.types';
import { Inject } from '@nestjs/common';
import { QuizPairRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-pair.repository';
import { QuizAnswer } from '../../Domain/quiz-answer.entity';
import { DomainException } from '../../../Common/Domain/Exceptions/domain-exceptions';
import { GameDataType } from '../../Domain/Types/game-data.types';
import { QuizAnswerRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-answer.repository';

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
  ) {}
  async execute(dto: SetAnswerForQuestionCommand): Promise<string> {
    const gameData: GameDataType | null =
      await this.quizPairRepository.getActiveGameData(dto.userInfo.sub);
    if (!gameData) {
      throw new DomainException('User is not in active pair', 403);
    }
    console.log(gameData);
    const newAnswer: QuizAnswer = QuizAnswer.createNew(
      gameData,
      dto.answer,
      dto.userInfo.sub,
    );
    await this.quizAnswerRepository.createNewAnswer(newAnswer);
    gameData.answers.push(newAnswer);
    gameData.pair.countScore(gameData.answers);
    gameData.pair.tryFinishGame(gameData.answers);
    await this.quizPairRepository.update(gameData.pair);
    return newAnswer.id;
  }
}
