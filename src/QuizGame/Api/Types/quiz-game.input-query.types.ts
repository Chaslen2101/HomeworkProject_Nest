import { SortDirectionEnum } from '../../../Common/Types/sort-direction.enum';

export type QuestionSanitizedQueryType = {
  bodySearchTerm: string | null;
  publishedStatus: boolean | null;
  sortBy: string;
  sortDirection: SortDirectionEnum;
  pageNumber: number;
  pageSize: number;
};

export type QuizPairSanitizedQueryType = {
  sortBy: string;
  sortDirection: SortDirectionEnum;
  pageNumber: number;
  pageSize: number;
};

export type QuizStatisticQueryType = {
  sort: string[];
  pageNumber: number;
  pageSize: number;
};
