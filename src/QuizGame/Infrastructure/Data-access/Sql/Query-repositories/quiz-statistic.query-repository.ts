import { InjectRepository } from '@nestjs/typeorm';
import { QuizStatisticTypeormEntity } from '../Entities/quiz-statistic.typeorm-entity';
import { Repository } from 'typeorm';
import { MapToViewQuizGame } from '../../../Mappers/quiz-game-view-model.mapper';
import {
  QuizStatisticPagesType,
  QuizStatisticTop10ViewType,
  QuizStatisticViewType,
} from '../../../../Api/Types/quiz-game-view-model.types';
import { QuizStatisticQueryType } from '../../../../Api/Types/quiz-game.input-query.types';
import { SortDirectionEnum } from '../../../../../Common/Types/sort-direction.enum';

export class QuizStatisticQueryRepository {
  constructor(
    @InjectRepository(QuizStatisticTypeormEntity)
    private quizStatisticRepository: Repository<QuizStatisticTypeormEntity>,
  ) {}

  async findStatisticByUserId(userId: string): Promise<QuizStatisticViewType> {
    const result: QuizStatisticTypeormEntity | null =
      await this.quizStatisticRepository.findOneBy({
        userId: userId,
      });

    return MapToViewQuizGame.mapStatistic(result);
  }

  async getAllStatistics(
    sanitizedQuery: QuizStatisticQueryType,
  ): Promise<QuizStatisticPagesType> {
    const toSkip: number =
      sanitizedQuery.pageSize * (sanitizedQuery.pageNumber - 1);

    const builder = this.quizStatisticRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .select(['s', 'u.id', 'u.login']);

    sanitizedQuery.sort.forEach((str, index) => {
      const [field, direction] = str.split(' ');
      if (index === 0) {
        builder.orderBy(`s.${field}`, direction as SortDirectionEnum);
      } else {
        builder.addOrderBy(`s.${field}`, direction as SortDirectionEnum);
      }
    });

    const [quizStatistics, totalCount] = await builder
      .take(sanitizedQuery.pageSize)
      .skip(toSkip)
      .getManyAndCount();

    const items: QuizStatisticTop10ViewType[] =
      MapToViewQuizGame.mapStatistics(quizStatistics);

    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: items,
    };
  }
}
