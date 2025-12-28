import { SortDirectionEnum } from '../../../Common/Types/sort-direction.enum';

export type QuestionQueryType = {
  bodySearchTerm: string | null;
  publishedStatus: boolean | null;
  sortBy: string;
  sortDirection: SortDirectionEnum;
  pageNumber: number;
  pageSize: number;
};

export type QuizPairQueryType = {
  sortBy: string;
  sortDirection: SortDirectionEnum;
  pageNumber: number;
  pageSize: number;
};
