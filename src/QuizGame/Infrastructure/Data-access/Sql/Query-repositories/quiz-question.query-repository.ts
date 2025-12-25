import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionTypeormEntity } from '../Entities/quiz-question-typeorm.entity';
import {
  QuestionPagesType,
  QuizQuestionViewType,
} from '../../../../Api/Types/quiz-game-view-model.types';
import { Repository } from 'typeorm';
import { MapToViewQuizGame } from '../../../Mappers/quiz-game-view-model.mapper';
import { QuestionQueryType } from '../../../../Api/Types/quiz-game.input-query.types';

@Injectable()
export class QuizQuestionQueryRepository {
  constructor(
    @InjectRepository(QuizQuestionTypeormEntity)
    private readonly questionRepository: Repository<QuizQuestionTypeormEntity>,
  ) {}

  async findQuestionById(
    questionId: string,
  ): Promise<QuizQuestionViewType | null> {
    const neededQuestion: QuizQuestionTypeormEntity | null =
      await this.questionRepository.findOneBy({ id: questionId });
    if (!neededQuestion) {
      return null;
    }
    return MapToViewQuizGame.mapQuestion(neededQuestion);
  }

  async findAll(sanitizedQuery: QuestionQueryType): Promise<QuestionPagesType> {
    const offsetValue: number =
      (sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize;
    const [items, totalCount] = await this.questionRepository
      .createQueryBuilder('q')
      .where(
        '(q.body ILIKE :bodyTerm AND (q.published = :published OR :published IS NOT DISTINCT FROM NULL))',
        {
          bodyTerm: sanitizedQuery.bodySearchTerm
            ? `%${sanitizedQuery.bodySearchTerm}%`
            : '%%',
          published: sanitizedQuery.publishedStatus,
        },
      )
      .orderBy(
        `q.${sanitizedQuery.sortBy}`,
        `${(sanitizedQuery.sortDirection as 'ASC') || 'DESC'}`,
      )
      .take(sanitizedQuery.pageSize)
      .skip(offsetValue)
      .getManyAndCount();

    const mappedQuestions: QuizQuestionViewType[] =
      MapToViewQuizGame.mapQuestions(items);
    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedQuestions,
    };
  }
}
