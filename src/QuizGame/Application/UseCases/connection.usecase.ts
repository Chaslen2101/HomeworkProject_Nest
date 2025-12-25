import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccessTokenPayloadType } from '../../../Common/Types/auth-payloads.types';
import { QuizPair } from '../../Domain/quiz-pair.entity';
import { Inject } from '@nestjs/common';
import { QuizPairRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-pair.repository';
import { QuizQuestionRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-question.repository';
import { QuizQuestion } from '../../Domain/quiz-question.entity';
import { DomainException } from '../../../Common/Domain/Exceptions/domain-exceptions';

export class ConnectionQuizGameCommand {
  constructor(public userInfo: AccessTokenPayloadType) {}
}

@CommandHandler(ConnectionQuizGameCommand)
export class ConnectionQuizGameUseCase
  implements ICommandHandler<ConnectionQuizGameCommand, string>
{
  constructor(
    @Inject(QuizPairRepository) private quizRepository: QuizPairRepository,
    @Inject(QuizQuestionRepository)
    private questionRepository: QuizQuestionRepository,
  ) {}

  async execute(dto: ConnectionQuizGameCommand): Promise<string> {
    const activePairWithPlayer: QuizPair | null =
      await this.quizRepository.findPairByUserId(dto.userInfo.sub);
    if (activePairWithPlayer) {
      throw new DomainException('User already in active game', 403);
    }
    const existingGame: QuizPair | null =
      await this.quizRepository.findExistingGame();
    if (!existingGame) {
      const randomQuestions: QuizQuestion[] =
        await this.questionRepository.getRandomQuestion();
      const newPair: QuizPair = QuizPair.createNew(dto.userInfo);
      const result: string = await this.quizRepository.createNewQuizGame(
        newPair,
        randomQuestions,
      );
      return result;
    }
    const activeGame: QuizPair = existingGame.addSecondPlayer(dto.userInfo);

    await this.quizRepository.addSecondPlayer(activeGame);
    return activeGame.id;
  }
}
