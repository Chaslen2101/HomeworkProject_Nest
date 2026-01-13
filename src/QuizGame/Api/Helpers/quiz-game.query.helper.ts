import { InputQueryType } from '../../../Common/Types/input-query.types';
import {
  QuestionSanitizedQueryType,
  QuizPairSanitizedQueryType,
  QuizStatisticQueryType,
} from '../Types/quiz-game.input-query.types';
import { SortDirectionEnum } from '../../../Common/Types/sort-direction.enum';

export class QuizGameQueryHelper {
  static questionQuery(query: InputQueryType): QuestionSanitizedQueryType {
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
        ? SortDirectionEnum.Descending
        : sortDirAllowedValues.includes(query.sortDirection.toUpperCase())
          ? (query.sortDirection.toUpperCase() as SortDirectionEnum)
          : SortDirectionEnum.Descending,
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
    };
  }

  static pairQuery(query: InputQueryType): QuizPairSanitizedQueryType {
    const sortDirAllowedValues: string[] = ['ASC', 'DESC'];
    return {
      sortBy: query.sortBy ? query.sortBy : 'pairCreatedDate',
      sortDirection: !query.sortDirection
        ? SortDirectionEnum.Descending
        : sortDirAllowedValues.includes(query.sortDirection.toUpperCase())
          ? (query.sortDirection.toUpperCase() as SortDirectionEnum)
          : SortDirectionEnum.Descending,
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
    };
  }

  static topPlayersQuery(query: InputQueryType): QuizStatisticQueryType {
    const sortDirAllowedValues: string[] = ['ASC', 'DESC'];

    if (query.sort && Array.isArray(query.sort)) {
      const sanitizedSort: string[] = query.sort.map((sortParam: string) => {
        const [field, direction] = sortParam.split(' ');
        const sortDirection: string = sortDirAllowedValues.includes(
          direction.toUpperCase(),
        )
          ? direction.toUpperCase()
          : SortDirectionEnum.Descending;
        return `${field} ${sortDirection}`;
      });
      return {
        sort: sanitizedSort,
        pageNumber: query.pageNumber ? +query.pageNumber : 1,
        pageSize: query.pageSize ? +query.pageSize : 10,
      };
    } else {
      return {
        sort: query.sort
          ? sortDirAllowedValues.includes(
              query.sort.split(' ')[1].toUpperCase(),
            )
            ? [
                `${query.sort.split(' ')[0]} ${query.sort.split(' ')[1].toUpperCase()}`,
              ]
            : ['avgScores DESC', 'sumScore DESC']
          : ['avgScores DESC', 'sumScore DESC'],
        pageNumber: query.pageNumber ? +query.pageNumber : 1,
        pageSize: query.pageSize ? +query.pageSize : 10,
      };
    }
  }
}
