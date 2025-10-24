import mongoose, {Schema} from "mongoose";
import {
    BlogsDBType,
    BlogsInputType,
    BlogsInstanceMethodsType,
    BlogsInstanceType,
    BlogsModelType,
    PostsInputType, PostsInstanceType
} from "../Types/Types";
import {BlogsModel, PostsModel} from "../db/MongoDB";
import {ObjectId} from "mongodb";

export const BlogsSchema: Schema<BlogsDBType, BlogsModelType, BlogsInstanceMethodsType> = new mongoose.Schema({
        id: String,
        name: String,
        description: String,
        websiteUrl: String,
        createdAt: Schema.Types.Date,
        isMembership: Boolean,
        posts: {type: [String], default: []}
    },
    {
        methods: {

            updateBlogData(this: BlogsInstanceType, newBlogData: BlogsInputType) {

                this.name = newBlogData.name
                this.description = newBlogData.description
                this.websiteUrl = newBlogData.websiteUrl
                return true
            },

            createPostForBlog(this: BlogsInstanceType, newPostData: PostsInputType) {

                const newPost: PostsInstanceType = new PostsModel({
                    id: new ObjectId().toString(),
                    title: newPostData.title,
                    shortDescription: newPostData.shortDescription,
                    content: newPostData.content,
                    blogId: this.id,
                    blogName: this.name,
                    createdAt: new Date(),
                    comments: [],
                    likesInfo: {
                        likedBy: [],
                        dislikedBy: [],
                        newestLikes: []
                    }
                })

                this.posts.push(newPost.id)

                return newPost
            },

            deletePost(this: BlogsInstanceType, postId: string) {

                const isPostExist: number = this.posts.indexOf(postId)
                if (isPostExist === -1) {throw new Error("Post doesn't exist")}
                this.posts.splice(isPostExist, 1)
                return true
            }


        },
            statics: {

                createBlog(newBlogData: BlogsInputType) {
                    return new BlogsModel({
                        id: new ObjectId().toString(),
                        name: newBlogData.name,
                        description: newBlogData.description,
                        websiteUrl: newBlogData.websiteUrl,
                        createdAt: new Date(),
                        isMembership: false
                    })
                }
            }
        })