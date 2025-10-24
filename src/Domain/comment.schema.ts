import mongoose, {Schema} from "mongoose";
import {
    CommentsDBType,
    CommentsInstanceMethodsType,
    CommentsInstanceType,
    CommentsModelType,
} from "../Types/Types";

export const CommentsScheme: Schema<CommentsDBType, CommentsModelType, CommentsInstanceMethodsType> = new mongoose.Schema({
        id: String,
        content: String,
        commentatorInfo: {
            userId: String,
            userLogin: String
        },
        createdAt: Schema.Types.Date,
        postId: String,
        likesInfo: {
            likedBy: {type: [String], default: []},
            dislikedBy: {type: [String], default: []}
        }
    },
    {
        methods: {
            updateCommentContent(this: CommentsInstanceType, newContent: string) {
                this.content = newContent
                return true
            },

            updateLikeStatus(this: CommentsInstanceType, likeStatus: string, userId: string) {

                if (likeStatus === "Like") {

                    if (!this.likesInfo.likedBy.includes(userId)) {

                        this.likesInfo.likedBy.push(userId)

                        const index: number = this.likesInfo.dislikedBy.indexOf(userId)
                        if (index > -1) {
                            this.likesInfo.dislikedBy.splice(index, 1)
                        }
                        return true
                    }
                    return true
                }

                if(likeStatus === "Dislike") {

                    if (!this.likesInfo.dislikedBy.includes(userId)) {

                        this.likesInfo.dislikedBy.push(userId)

                        const index: number = this.likesInfo.likedBy.indexOf(userId)
                        if (index > -1) {
                            this.likesInfo.likedBy.splice(index, 1)
                        }
                        return true
                    }
                    return true
                }

                if(likeStatus === "None") {

                    const likedByIndex: number = this.likesInfo.likedBy.indexOf(userId)
                    if (likedByIndex > -1) {
                        this.likesInfo.likedBy.splice(likedByIndex, 1)
                    }

                    const dislikedByIndex: number = this.likesInfo.dislikedBy.indexOf(userId)
                    if (dislikedByIndex > -1) {
                        this.likesInfo.dislikedBy.splice(dislikedByIndex, 1)
                    }
                    return true
                }
                return false
            }

        },
        statics: {

        }
    })