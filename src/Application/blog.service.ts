import {BlogsInputType, BlogsInstanceType} from "../../Types/Types";
import {BlogsRepository} from "../../Infrastructure/Repository/blogsRepository";
import {inject, injectable} from "inversify";
import {BlogsModel} from "../../db/MongoDB";


@injectable()
export class BlogsService {

    constructor(
        @inject(BlogsRepository) protected blogsRepository: BlogsRepository
    ) {}

    async createBlog (blogData: BlogsInputType) {

        const newBlog: BlogsInstanceType = BlogsModel.createBlog(blogData)
        await this.blogsRepository.save(newBlog)
        return newBlog.id
    }

    async updateBlog (blogId: string, newBlogData: BlogsInputType) {

        const neededBlog: BlogsInstanceType | null = await this.blogsRepository.findById(blogId)
        if(!neededBlog) {throw new Error("Cant find needed blog")}
        neededBlog.updateBlogData(newBlogData)
        await this.blogsRepository.save(neededBlog)
        return true
    }

    async deleteBlog (id: string) {

        return await this.blogsRepository.delete(id)
    }
}

