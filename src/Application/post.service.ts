import {PostsRepository} from "../../Infrastructure/Repository/postsRepository";
import {
    AccessTokenPayloadType,
    BlogsInstanceType,
    PostsInputType,
    PostsInstanceType
} from "../../Types/Types";
import {inject, injectable} from "inversify";
import {BlogsRepository} from "../../Infrastructure/Repository/blogsRepository";


@injectable()
export class PostsService {

    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository,
        @inject(BlogsRepository) protected blogsRepository: BlogsRepository
    ) {}

    async createPost (newPostData: PostsInputType, blogIdFromParams?: string): Promise<string> {

        const neededBlogId: string = newPostData.blogId ? newPostData.blogId : blogIdFromParams ? blogIdFromParams : "";
        const neededBlog: BlogsInstanceType | null = await this.blogsRepository.findById(neededBlogId)
        if (!neededBlog) {throw new Error("Cant find needed blog")}
        newPostData.blogId = neededBlogId
        const newPost: PostsInstanceType = neededBlog.createPostForBlog(newPostData)
        await this.postsRepository.save(newPost)
        return newPost.id
    }

    async updatePost(postId: string, newData: PostsInputType): Promise<boolean> {

        const neededPost: PostsInstanceType | null = await this.postsRepository.findById(postId)
        if(!neededPost) {
            return false
        }
        neededPost.updatePost(newData)
        await this.postsRepository.save(neededPost)
        return true
    }

    async deletePost (id: string): Promise<boolean> {

        const neededPost: PostsInstanceType | null = await this.postsRepository.findById(id)
        if(!neededPost) {throw new Error("Cant find needed post")}
        const neededBlog: BlogsInstanceType | null = await this.blogsRepository.findById(neededPost.blogId)
        if(!neededBlog) {throw new Error("Post has invalid blogID")}
        neededBlog.deletePost(id)
        return await this.postsRepository.delete(id)
    }

    async updateLikeStatus (postId: string, likeStatus: string, userInfo: AccessTokenPayloadType): Promise<boolean> {

        const neededPost: PostsInstanceType | null = await this.postsRepository.findById(postId)
        if(!neededPost) {throw new Error("Cant find needed post")}

        const isLikeStatusUpdated: boolean = neededPost.updateLikeStatus(userInfo,likeStatus)
        if(!isLikeStatusUpdated) {throw new Error("Invalid like status")}

        await this.postsRepository.save(neededPost)

        return true
    }
}

