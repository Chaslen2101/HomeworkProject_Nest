import { InputQueryType } from '../../../Common/Types/input-query.types';
import { UserQueryType } from '../Types/user-account.input-query.types';

export const userAccountQueryHelper = {
  userQuery(query: InputQueryType): UserQueryType {
    const sortDirAllowedValues: string[] = ['ASC', 'DESC'];
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize !== undefined ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: !query.sortDirection
        ? 'DESC'
        : sortDirAllowedValues.includes(query.sortDirection.toUpperCase())
          ? query.sortDirection.toUpperCase()
          : 'DESC',
      searchLoginTerm: query.searchLoginTerm ? query.searchLoginTerm : null,
      searchEmailTerm: query.searchEmailTerm ? query.searchEmailTerm : null,
    };
  },
};
