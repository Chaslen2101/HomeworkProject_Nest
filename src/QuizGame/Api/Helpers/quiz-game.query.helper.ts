import { InputQueryType } from '../../../Common/Types/input-query.types';
import { QuestionQueryType } from '../Types/quiz-game.input-query.types';

export class QuizGameQueryHelper {
  static questionQuery(query: InputQueryType): QuestionQueryType {
    const sortDirAllowedValues: string[] = ['ASC', 'DESC'];
    const publishedStatusAllowedValues: string[] = [
      'all',
      'published',
      'notpublished',
    ];
    let publishedStatus: boolean | null = null;
    if (
      query.publishedStatus &&
      publishedStatusAllowedValues.includes(query.publishedStatus.toLowerCase())
    ) {
      if (query.publishedStatus === 'published') {
        publishedStatus = true;
      }
      if (query.publishedStatus === 'notPublished') {
        publishedStatus = false;
      }
    }
    return {
      bodySearchTerm: query.bodySearchTerm ? query.bodySearchTerm : null,
      publishedStatus: publishedStatus,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: !query.sortDirection
        ? 'DESC'
        : sortDirAllowedValues.includes(query.sortDirection.toUpperCase())
          ? query.sortDirection.toUpperCase()
          : 'DESC',
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
    };
  }
}
