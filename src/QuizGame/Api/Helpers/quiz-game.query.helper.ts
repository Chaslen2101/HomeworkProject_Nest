import { InputQueryType } from '../../../Common/Types/input-query.types';
import {
  QuestionQueryType,
  QuizPairQueryType,
} from '../Types/quiz-game.input-query.types';
import { SortDirectionEnum } from '../../../Common/Types/sort-direction.enum';

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
        ? SortDirectionEnum.DEscending
        : sortDirAllowedValues.includes(query.sortDirection.toUpperCase())
          ? (query.sortDirection.toUpperCase() as SortDirectionEnum)
          : SortDirectionEnum.DEscending,
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
    };
  }

  static pairQuery(query: InputQueryType): QuizPairQueryType {
    const sortDirAllowedValues: string[] = ['ASC', 'DESC'];
    return {
      sortBy: query.sortBy ? query.sortBy : 'pairCreatedDate',
      sortDirection: !query.sortDirection
        ? SortDirectionEnum.DEscending
        : sortDirAllowedValues.includes(query.sortDirection.toUpperCase())
          ? (query.sortDirection.toUpperCase() as SortDirectionEnum)
          : SortDirectionEnum.DEscending,
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
    };
  }
}
