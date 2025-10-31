import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';

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

export type BlogPostQueryType = {
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

export type AccessTokenPayloadType = {
  id: string;
  login: string;
};

export type RefreshTokenPayload = {
  deviceId: string;
  id: string;
  login: string;
};

export const RefreshTokenPayloadSchema: Schema<RefreshTokenPayload> =
  new mongoose.Schema({
    deviceId: String,
    id: String,
    login: String,
  });

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

export type SessionsInfoDBType = {
  ip: string | undefined;
  title: string | undefined;
  lastActiveDate: Date;
  deviceId: string;
  userId: string;
};

export type SessionsInfoViewType = {
  ip: string | undefined;
  title: string | undefined;
  lastActiveDate: Date;
  deviceId: string;
};

export type SessionsInfoInstanceMethodsType = {};

export type SessionsInfoInstanceType = HydratedDocument<
  SessionsInfoDBType,
  SessionsInfoInstanceMethodsType
>;

export type SessionsInfoModelType = Model<
  SessionsInfoDBType,
  {},
  SessionsInfoInstanceMethodsType
> & {
  createNewSession(
    deviceId: string,
    userId: string,
    ip: string | undefined,
    deviceName: string | undefined,
  ): SessionsInfoInstanceType;
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
  blogPostQuery(query: InputQueryType): BlogPostQueryType;

  userQuery(query: InputQueryType): UserQueryType;

  commentsQuery(query: InputQueryType): CommentQueryType;
};

export type ExceptionResponseType = {
  message: [];
  error: string;
  statusCode: number;
};
