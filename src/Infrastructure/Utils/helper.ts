import {
  BlogQueryType,
  CommentQueryType,
  InputQueryType,
  PostQueryType,
  QueryHelperType,
  UserQueryType,
} from '../../Domain/Types/Types';
import * as argon2 from 'argon2';

export const queryHelper: QueryHelperType = {
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

  toSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  },
};

export const hashHelper = {
  async hash(smthToHash: string): Promise<string> {
    return await argon2.hash(smthToHash, {
      type: argon2.argon2id, // Лучший вариант - защита от GPU и side-channel атак
      memoryCost: 2 ** 16, // 64 MB памяти
      timeCost: 3, // 3 итерации
      parallelism: 1, // 1 поток
      hashLength: 32, // 32 байта хеш
    });
  },

  async compare(someStringToComp: string, hashedString: string) {
    return await argon2.verify(hashedString, someStringToComp);
  },
};
