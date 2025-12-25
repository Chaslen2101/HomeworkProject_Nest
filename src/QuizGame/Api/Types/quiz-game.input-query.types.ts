export type QuestionQueryType = {
  bodySearchTerm: string | null;
  publishedStatus: boolean | null;
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
};
