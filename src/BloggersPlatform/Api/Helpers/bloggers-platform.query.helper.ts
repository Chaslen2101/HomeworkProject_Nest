import { InputQueryType } from '../../../Common/Types/input-query.types';
import {
  BlogQueryType,
  CommentQueryType,
  PostQueryType,
} from '../Types/bloggers-platform.input-query.types';

export const bloggersPlatformQueryHelper = {
  blogQuery(query: InputQueryType): BlogQueryType {
    const sortDirAllowedValues: string[] = ['ASC', 'DESC'];
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: !query.sortDirection
        ? 'DESC'
        : sortDirAllowedValues.includes(query.sortDirection.toUpperCase())
          ? query.sortDirection.toUpperCase()
          : 'DESC',
      searchNameTerm: query.searchNameTerm ? query.searchNameTerm : null,
    };
  },

  postQuery(query: InputQueryType, blogId?: string): PostQueryType {
    const sortDirAllowedValues: string[] = ['ASC', 'DESC'];
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: !query.sortDirection
        ? 'DESC'
        : sortDirAllowedValues.includes(query.sortDirection.toUpperCase())
          ? query.sortDirection.toUpperCase()
          : 'DESC',
      blogId: blogId ? blogId : null,
    };
  },

  commentsQuery(query: InputQueryType): CommentQueryType {
    const sortDirAllowedValues: string[] = ['ASC', 'DESC'];
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: !query.sortDirection
        ? 'DESC'
        : sortDirAllowedValues.includes(query.sortDirection.toUpperCase())
          ? query.sortDirection.toUpperCase()
          : 'DESC',
    };
  },
};
