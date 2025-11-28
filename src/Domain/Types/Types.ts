import mongoose, { Schema } from 'mongoose';

export type InputQueryType = {
  [key: string]: string | undefined;
};

export type BlogViewType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

export type BlogPagesType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogViewType[];
};

export type BlogQueryType = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
  searchNameTerm: string | null;
};

export type PostViewType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: {
      addedAt: Date;
      userId: string;
      login: string;
    }[];
  };
};

export type PostPagesType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostViewType[];
};

export type PostQueryType = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
  blogId: string | null;
};

export type UserPagesType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UserViewType[];
};

export type UserViewType = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};

export type UserQueryType = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
};

export type MyInfoType = {
  email: string;
  login: string;
  userId: string;
};

export type CommentatorInfoType = {
  userId: string;
  userLogin: string;
};

export type CommentViewType = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
};
export type CommentPagesType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentViewType[];
};

export type CommentQueryType = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
};

export type NewestLikesType = {
  addedAt: Date;
  userId: string;
  login: string;
};

export type SessionViewType = {
  ip: string | undefined;
  title: string | undefined;
  lastActiveDate: Date;
  deviceId: string;
};

export class ApiRequestsInfoClass {
  constructor(
    public ip: string | undefined,
    public URL: string,
    public date: Date,
  ) {}
}

export const ApiRequestsInfoSchema: Schema<ApiRequestsInfoClass> =
  new mongoose.Schema({
    ip: String,
    URL: String,
    date: Schema.Types.Date,
  });

export type QueryHelperType = {
  blogQuery(query: InputQueryType): BlogQueryType;

  postQuery(query: InputQueryType, blogId?: string): PostQueryType;

  userQuery(query: InputQueryType): UserQueryType;

  commentsQuery(query: InputQueryType): CommentQueryType;

  toSnake(str: string): string;
};

export type ExceptionResponseType = {
  message: [];
  error: string;
  statusCode: number;
};

export type AccessTokenPayloadType = {
  sub: string;
  login: string;
};

export type RefreshTokenPayloadType = {
  sub: string;
  login: string;
  deviceId: string;
};

export type TokenPairType = {
  accessToken: string;
  refreshToken: string;
};
