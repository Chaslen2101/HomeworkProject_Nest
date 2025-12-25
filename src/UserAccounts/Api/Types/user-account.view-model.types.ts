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
export type MyInfoType = {
  email: string;
  login: string;
  userId: string;
};
export type SessionViewType = {
  ip: string | undefined;
  title: string | undefined;
  lastActiveDate: Date;
  deviceId: string;
};
