import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { QuizStatisticRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-statistic.repository';
import { QuizStatistic } from '../../Domain/quiz-statistic.entity';
import { QuizPair } from '../../Domain/quiz-pair.entity';

export class FinishedGameEvent {
  constructor(
    public quizPair: QuizPair,
    public manager,
  ) {}
}

@EventsHandler(FinishedGameEvent)
export class FinishGameUseCase implements IEventHandler<FinishedGameEvent> {
  constructor(
    @Inject(QuizStatisticRepository)
    private statisticRepository: QuizStatisticRepository,
  ) {}

  async handle(dto: FinishedGameEvent): Promise<void> {
    let firstPlayerStatistic: QuizStatistic | null =
      await this.statisticRepository.findStatisticByUserId(
        dto.quizPair.firstPlayerId,
        dto.manager,
      );
    if (!firstPlayerStatistic) {
      firstPlayerStatistic = QuizStatistic.createNew(
        dto.quizPair.firstPlayerId,
      );
    }
    firstPlayerStatistic.updateStatistic(dto.quizPair);

    let secondPlayerStatistic: QuizStatistic | null =
      await this.statisticRepository.findStatisticByUserId(
        dto.quizPair.secondPlayerId!,
        dto.manager,
      );
    if (!secondPlayerStatistic) {
      secondPlayerStatistic = QuizStatistic.createNew(
        dto.quizPair.secondPlayerId!,
      );
    }
    secondPlayerStatistic.updateStatistic(dto.quizPair);

    await this.statisticRepository.update(firstPlayerStatistic, dto.manager);
    await this.statisticRepository.update(secondPlayerStatistic, dto.manager);
    return;
  }
}
