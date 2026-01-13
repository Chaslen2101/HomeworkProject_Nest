import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { QuizStatisticTypeormEntity } from '../Entities/quiz-statistic.typeorm-entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { QuizGameEntityMapper } from '../../../Mappers/quiz-game-entity.mapper';
import { QuizStatistic } from '../../../../Domain/quiz-statistic.entity';

export class QuizStatisticRepository {
  constructor(
    @InjectRepository(QuizStatisticTypeormEntity)
    private readonly quizStatisticRepository: Repository<QuizStatisticTypeormEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private getRepo(
    manager?: EntityManager,
  ): Repository<QuizStatisticTypeormEntity> {
    return (manager || this.dataSource).getRepository(
      QuizStatisticTypeormEntity,
    );
  }

  async findStatisticByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<QuizStatistic | null> {
    const result: QuizStatisticTypeormEntity | null = await this.getRepo(
      manager,
    ).findOneBy({ userId: userId });
    if (!result) return null;
    return QuizGameEntityMapper.statisticToDomainEntity(result);
  }

  async update(
    statistic: QuizStatistic,
    manager?: EntityManager,
  ): Promise<QuizStatisticTypeormEntity> {
    const statisticTypeorm: QuizStatisticTypeormEntity =
      QuizGameEntityMapper.statisticToTypeormEntity(statistic);
    return await this.getRepo(manager).save(statisticTypeorm);
  }
}
