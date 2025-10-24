import mongoose, {Schema} from "mongoose";
import {
    AccessTokenPayloadType,
    CommentsInstanceType,
    PostsDBType,
    PostsInputType,
    PostsInstanceMethodsType, PostsInstanceType,
    PostsModelType, UserViewType
} from "../Types/Types";
import {CommentsModel} from "../db/MongoDB";
import {ObjectId} from "mongodb";

export const PostsSchema: Schema<PostsDBType, PostsModelType, PostsInstanceMethodsType> = new mongoose.Schema({
        id: String,
        title: String,
        shortDescription: String,
        content: String,
        blogId: String,
        blogName: String,
        createdAt: Schema.Types.Date,
        comments: {type: [String], default: []},
        likesInfo: {
            likedBy: {type: [String], default: []},
            dislikedBy: {type: [String], default: []},
            newestLikes: {
                type: [{
                    _id: false,
                    addedAt: Schema.Types.Date,
                    userId: String,
                    login: String
                }], default: []
            }
        }
    },
    {
        methods: {

            updatePost(this: PostsInstanceType, newData: PostsInputType) {

                this.title = newData.title
                this.shortDescription = newData.shortDescription
                this.content = newData.content
                this.blogId = newData.blogId
                return true
            },

            createComment(this: PostsInstanceType, content: string, userInfo: UserViewType) {

                const newComment: CommentsInstanceType = new CommentsModel({
                    id: new ObjectId().toString(),
                    content: content,
                    commentatorInfo: {
                        userId: userInfo.id,
                        userLogin: userInfo.login
                    },
                    createdAt: new Date(),
                    postId: this.id,
                    likesInfo: {
                        likedBy: [],
                        dislikedBy: []
                    }
                })
                this.comments.push(newComment.id)

                return newComment
            },

            deleteComment(this: PostsInstanceType, commentId: string) {

                const isCommentExist: number = this.comments.indexOf(commentId)
                if (isCommentExist === -1) {
                    throw new Error("Comment does not exist")
                }
                this.comments.splice(isCommentExist, 1)
                return true
            },

            updateLikeStatus(this: PostsInstanceType, userInfo: AccessTokenPayloadType, likeStatus: string) {

                if (likeStatus === "Like") {

                    if (!this.likesInfo.likedBy.includes(userInfo.id)) {

                        this.likesInfo.likedBy.push(userInfo.id)

                        const index: number = this.likesInfo.dislikedBy.indexOf(userInfo.id)
                        if (index > -1) {
                            this.likesInfo.dislikedBy.splice(index, 1)
                        }

                        this.likesInfo.newestLikes.unshift({
                            addedAt: new Date(),
                            userId: userInfo.id,
                            login: userInfo.login
                        })

                        if (this.likesInfo.newestLikes.length > 3) {
                            this.likesInfo.newestLikes.pop()
                        }

                        return true
                    }
                    return true
                }

                if (likeStatus === "Dislike") {

                    if (!this.likesInfo.dislikedBy.includes(userInfo.id)) {

                        this.likesInfo.dislikedBy.push(userInfo.id)

                        const index: number = this.likesInfo.likedBy.indexOf(userInfo.id)
                        if (index > -1) {
                            this.likesInfo.likedBy.splice(index, 1)
                        }

                        const isLikeNewest: number = this.likesInfo.newestLikes.findIndex(like => like.userId === userInfo.id)
                        if (isLikeNewest > -1) {
                            this.likesInfo.newestLikes.splice(isLikeNewest, 1)
                        }

                        return true
                    }
                    return true
                }

                if (likeStatus === "None") {

                    const likedByIndex: number = this.likesInfo.likedBy.indexOf(userInfo.id)
                    if (likedByIndex > -1) {
                        this.likesInfo.likedBy.splice(likedByIndex, 1)
                    }

                    const dislikedByIndex: number = this.likesInfo.dislikedBy.indexOf(userInfo.id)
                    if (dislikedByIndex > -1) {
                        this.likesInfo.dislikedBy.splice(dislikedByIndex, 1)
                    }

                    const isLikeNewest: number = this.likesInfo.newestLikes.findIndex(like => like.userId === userInfo.id)
                    if (isLikeNewest > -1) {
                        this.likesInfo.newestLikes.splice(isLikeNewest, 1)
                    }

                    return true
                }
                return false
            }
        },
        statics: {}
    }
)