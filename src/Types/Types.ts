import {SortDirection} from "mongodb";
import mongoose, {HydratedDocument, Model, Schema} from "mongoose";

export type InputQueryType = {
    [key: string]: string | undefined
}

export type BlogsDBType = {
        id: string,
        name: string,
        description: string,
        websiteUrl: string,
        createdAt: Date,
        isMembership: boolean
        posts: string[]
}

export type BlogsViewType = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: Date,
    isMembership: boolean
}

export type BlogsInstanceType = HydratedDocument<BlogsDBType,BlogsInstanceMethodsType>

export type BlogsInstanceMethodsType = {
    updateBlogData(this: BlogsInstanceType, newBlogData: BlogsInputType): boolean
    createPostForBlog(this: BlogsInstanceType, newPostData: PostsInputType): PostsInstanceType
    deletePost(this: BlogsInstanceType, postId: string): boolean
}

export type BlogsModelType = Model<BlogsDBType,{},BlogsInstanceMethodsType> & {
    createBlog(newBlogData: BlogsInputType): BlogsInstanceType
}

export type BlogsPagesType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: BlogsViewType[]
}

export type BlogsInputType = {
    name: string
    description: string
    websiteUrl: string
}

export type BlogsPostsQueryType = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: SortDirection,
    searchNameTerm: string | undefined,
}

export type PostsDBType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date,
    comments: string[]
    likesInfo: {
        likedBy: string[],
        dislikedBy: string[]
        newestLikes: {
            addedAt: Date,
            userId: string,
            login: string
        }[]
    }
}

export type PostsViewType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date
    extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: string,
        newestLikes: {
            addedAt: Date,
            userId: string,
            login: string
        }[]
    }
}

export type PostsInstanceType = HydratedDocument<PostsDBType, PostsInstanceMethodsType>;

export type PostsInstanceMethodsType = {
    updatePost(this: PostsInstanceType, newData: PostsInputType): true
    createComment(this: PostsInstanceType, content: string, userInfo: UserViewType): CommentsInstanceType
    deleteComment(this: PostsInstanceType, commentId: string): true
    updateLikeStatus(this: PostsInstanceType, userInfo: AccessTokenPayloadType, likeStatus: string): boolean
}

export type PostsModelType = Model<PostsDBType, {}, PostsInstanceMethodsType> & {}

export type PostsInputType = {
    title: string
    shortDescription: string
    content: string
    blogId: string
}

export type PostsPagesType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: PostsViewType[]
}

export type UserInputType = {
    login: string,
    password: string,
    email: string
}

export type UsersPagesType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: UserViewType[]
}

export type UserDBType = {
    id: string,
    login: string,
    email: string,
    password: string,
    createdAt: Date,
    emailConfirmationInfo: {
        confirmationCode: string | null,
        expirationDate: Date | null,
        isConfirmed: boolean
    },
    passwordRecoveryCode: {
        confirmationCode: string | null,
        expirationDate: Date | null
    }
}

export type UserViewType = {
    id: string,
    login: string,
    email: string,
    createdAt: Date
}

export type UserInstanceMethodsType = {}

export type UserInstanceType = HydratedDocument<UserDBType, UserInstanceMethodsType>

export type UserModelType = Model<UserDBType, {}, UserInstanceMethodsType> & {
    createNewUser(userData: UserInputType, password: string, confirmCode?: string): UserInstanceType
}

export type UserQueryType = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: SortDirection,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null
}

export type AccessTokenPayloadType = {
    id: string,
    login: string
}

export type RefreshTokenPayload = {
    deviceId: string,
    id: string,
    login: string
}

export const RefreshTokenPayloadSchema: Schema<RefreshTokenPayload> = new mongoose.Schema({
    deviceId: String,
    id: String,
    login: String
})

export type CommentatorInfoType = {
    userId: string,
    userLogin: string
}

export type CommentsDBType = {
    id: string,
    content: string,
    commentatorInfo: CommentatorInfoType,
    createdAt: Date,
    postId: string,
    likesInfo: {
        likedBy: string[],
        dislikedBy: string[]
    }
}

export type CommentsViewType = {
    id: string,
    content: string,
    commentatorInfo: CommentatorInfoType,
    createdAt: Date,
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: string
    }
}

export type CommentsInstanceMethodsType = {
    updateCommentContent(newContent: string): boolean
    updateLikeStatus(this: CommentsInstanceType, likeStatus: string, userId: string): boolean
}

export type CommentsModelType = Model<CommentsDBType,{},CommentsInstanceMethodsType> & {}

export type CommentsInstanceType = HydratedDocument<CommentsDBType,CommentsInstanceMethodsType>

export type CommentsPagesType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: CommentsViewType[]
}

export type CommentsQueryType = {
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: SortDirection
}

export type SessionsInfoDBType = {
    ip: string | undefined
    title: string | undefined
    lastActiveDate: Date
    deviceId: string
    userId: string
}

export type SessionsInfoViewType = {
    ip: string | undefined,
    title: string | undefined,
    lastActiveDate: Date,
    deviceId: string,
}

export type SessionsInfoInstanceMethodsType = {}

export type SessionsInfoInstanceType = HydratedDocument<SessionsInfoDBType, SessionsInfoInstanceMethodsType>

export type SessionsInfoModelType = Model<SessionsInfoDBType, {}, SessionsInfoInstanceMethodsType> & {
    createNewSession(deviceId: string, userId: string, ip: string | undefined, deviceName: string | undefined): SessionsInfoInstanceType
}

export class ApiRequestsInfoClass {
    constructor(
        public ip: string | undefined,
        public URL: string,
        public date: Date
    ) {
    }
}

export const ApiRequestsInfoSchema: Schema<ApiRequestsInfoClass> = new mongoose.Schema({
    ip: String,
    URL: String,
    date: Schema.Types.Date,
})