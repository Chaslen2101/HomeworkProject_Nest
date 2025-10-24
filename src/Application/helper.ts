import {SortDirection} from "mongodb";
import bcrypt from "bcrypt"
import {
    CommentsViewType,
    UserDBType,
    InputQueryType,
    UserViewType,
    CommentsDBType,
    SessionsInfoDBType, SessionsInfoViewType, PostsDBType, PostsViewType, BlogsDBType, BlogsViewType
} from "../../../Types/Types";

export const queryHelper = {

    blogsPostsQuery(query: { [key: string]: string | undefined }) {
        return {
            pageNumber: query.pageNumber ? +query.pageNumber : 1,
            pageSize: query.pageSize !== undefined ? +query.pageSize : 10,
            sortBy: query.sortBy ? query.sortBy : 'createdAt',
            sortDirection: query.sortDirection ? query.sortDirection as SortDirection : 'desc',
            searchNameTerm: query.searchNameTerm ? query.searchNameTerm : undefined,
        }
    },

    userQuery(query: InputQueryType) {
        return {
            pageNumber: query.pageNumber ? +query.pageNumber : 1,
            pageSize: query.pageSize !== undefined ? +query.pageSize : 10,
            sortBy: query.sortBy ? query.sortBy : 'createdAt',
            sortDirection: query.sortDirection ? query.sortDirection as SortDirection : 'desc',
            searchLoginTerm: query.searchLoginTerm ? query.searchLoginTerm : null,
            searchEmailTerm: query.searchEmailTerm ? query.searchEmailTerm : null
        }
    },

    commentsQuery(query: InputQueryType) {
        return {
            pageNumber: query.pageNumber ? +query.pageNumber : 1,
            pageSize: query.pageSize ? +query.pageSize : 10,
            sortBy: query.sortBy ? query.sortBy : "createdAt",
            sortDirection: query.sortDirection ? query.sortDirection as SortDirection : "desc"
        }
    }
}

export const hashHelper = {

    async hashNewPassword(password: string) {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
    },

    async comparePassword(hashedPassword: string, somePassword: string) {
        return await bcrypt.compare(somePassword, hashedPassword)
    }
}

export const mapToView = {

    mapComments(comments: CommentsDBType[], userId: string): CommentsViewType[] {
        return comments.map(comment => {
            let status: string = "None"
            if (comment.likesInfo.likedBy.includes(userId)) {
                status = "Like"
            }
            if (comment.likesInfo.dislikedBy.includes(userId)) {
                status = "Dislike"
            }
            return {
                id: comment.id,
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin
                },
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: comment.likesInfo.likedBy.length,
                    dislikesCount: comment.likesInfo.dislikedBy.length,
                    myStatus: status
                }
            }
        })
    },

    mapComment(comment: CommentsDBType, userId: string): CommentsViewType {
        let status: string = "None"
        if (comment.likesInfo.likedBy.includes(userId)) {
            status = "Like"
        }
        if (comment.likesInfo.dislikedBy.includes(userId)) {
            status = "Dislike"
        }
        return {
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: comment.createdAt,
            likesInfo: {
                likesCount: comment.likesInfo.likedBy.length,
                dislikesCount: comment.likesInfo.dislikedBy.length,
                myStatus: status
            }
        }
    },

    mapUsers(users: UserDBType[]): UserViewType[] {
        return users.map(user => {
            return {
                id: user.id,
                login: user.login,
                email: user.email,
                createdAt: user.createdAt
            }
        })
    },

    mapUser(userData: UserDBType): UserViewType {
        return {
            id: userData.id,
            login: userData.login,
            email: userData.email,
            createdAt: userData.createdAt
        }
    },

    mapSessionsInfo(sessionsInfo: SessionsInfoDBType[]): SessionsInfoViewType[] {
        return sessionsInfo.map(sessionInfo => {
            return {
                ip: sessionInfo.ip,
                title: sessionInfo.title,
                lastActiveDate: sessionInfo.lastActiveDate,
                deviceId: sessionInfo.deviceId,
            }
        })
    },

    mapSessionInfo(sessionInfo: SessionsInfoDBType): SessionsInfoViewType {
        return {
            ip: sessionInfo.ip,
            title: sessionInfo.title,
            lastActiveDate: sessionInfo.lastActiveDate,
            deviceId: sessionInfo.deviceId,
        }
    },

    mapPost(post: PostsDBType, userId: string): PostsViewType {
        let status: string = "None"
        if (post.likesInfo.likedBy.includes(userId)) {
            status = "Like"
        }
        if (post.likesInfo.dislikedBy.includes(userId)) {
            status = "Dislike"
        }
        return {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                likesCount: post.likesInfo.likedBy.length,
                dislikesCount: post.likesInfo.dislikedBy.length,
                myStatus: status,
                newestLikes: post.likesInfo.newestLikes
            }
        }
    },

    mapPosts(posts: PostsDBType[], userId: string): PostsViewType[] {
        return posts.map(post => {
            let status: string = "None"
            if (post.likesInfo.likedBy.includes(userId)) {
                status = "Like"
            }
            if (post.likesInfo.dislikedBy.includes(userId)) {
                status = "Dislike"
            }
            return {
                id: post.id,
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: post.likesInfo.likedBy.length,
                    dislikesCount: post.likesInfo.dislikedBy.length,
                    myStatus: status,
                    newestLikes: post.likesInfo.newestLikes
                }
            }
        })
    },

    mapBlog(blog: BlogsDBType): BlogsViewType {
        return {
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership,
        }
    },

    mapBlogs(blogs: BlogsDBType[]): BlogsViewType[] {
        return blogs.map(blog => {
            return {
                id: blog.id,
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership,
            }

        })
    }

}





