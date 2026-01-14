import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuizPairRepository } from '../Data-access/Sql/Repositories/quiz-pair.repository';
import { QuizPair } from '../../Domain/quiz-pair.entity';
import { CommandBus } from '@nestjs/cqrs';
import { CountStatisticsCommand } from '../../Application/UseCases/count-statistics.usecase';

@Injectable()
export class FinishGameEarlierScheduler {
  constructor(
    @Inject(QuizPairRepository)
    private readonly quizPairRepository: QuizPairRepository,
    @Inject(CommandBus) private readonly commandBus: CommandBus,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async handleExpiredGames() {
    const pairs: QuizPair[] =
      await this.quizPairRepository.getPairWithExpiredFinishTimer();
    if (pairs.length === 0) {
      return;
    }

    for (const pair of pairs) {
      try {
        pair.finishEarlier();
        await this.quizPairRepository.update(pair);
        await this.commandBus.execute(new CountStatisticsCommand(pair));
      } catch (e) {
        console.log({ error: e });
      }
    }
  }
}
