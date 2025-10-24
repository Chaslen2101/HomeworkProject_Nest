import {BlogsInputType, BlogsInstanceType} from "../../Types/Types";
import {BlogsModel} from "../../db/MongoDB";
import {DeleteResult, UpdateResult} from "mongodb";
import {injectable} from "inversify";


@injectable()
export class BlogsRepository {

    async save (blog: BlogsInstanceType): Promise<BlogsInstanceType> {
        return blog.save()
    }

    async findById (blogId: string): Promise<BlogsInstanceType | null> {
        return BlogsModel.findOne({id: blogId})
    }

    async delete(id: string): Promise<boolean> {
        const result: DeleteResult = await BlogsModel.deleteOne({id: id})
        return result.deletedCount !== 0
    }

    async update(id: string, newInfo: BlogsInputType): Promise<boolean> {
        const result: UpdateResult = await BlogsModel.updateOne(
            {id: id},
            {$set: {
                        name: newInfo.name,
                        description: newInfo.description,
                        websiteUrl: newInfo.websiteUrl
            }
        })
        return result.modifiedCount !== 0
    }
}