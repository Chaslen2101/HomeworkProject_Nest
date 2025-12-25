export type UserQueryType = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
};
