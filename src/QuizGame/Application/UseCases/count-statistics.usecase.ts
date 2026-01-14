import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { QuizStatisticRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-statistic.repository';
import { QuizStatistic } from '../../Domain/quiz-statistic.entity';
import { QuizPair } from '../../Domain/quiz-pair.entity';

export class CountStatisticsCommand {
  constructor(public quizPair: QuizPair) {}
}

@CommandHandler(CountStatisticsCommand)
export class CountStatisticsUseCase
  implements ICommandHandler<CountStatisticsCommand>
{
  constructor(
    @Inject(QuizStatisticRepository)
    private statisticRepository: QuizStatisticRepository,
  ) {}

  public async execute(dto: CountStatisticsCommand): Promise<void> {
    let firstPlayerStatistic: QuizStatistic | null =
      await this.statisticRepository.findStatisticByUserId(
        dto.quizPair.firstPlayerId,
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
      );
    if (!secondPlayerStatistic) {
      secondPlayerStatistic = QuizStatistic.createNew(
        dto.quizPair.secondPlayerId!,
      );
    }
    secondPlayerStatistic.updateStatistic(dto.quizPair);
    await this.statisticRepository.update(firstPlayerStatistic);
    await this.statisticRepository.update(secondPlayerStatistic);

    return;
  }
}
