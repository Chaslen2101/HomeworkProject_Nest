import {PostsInstanceType} from "../../Types/Types";
import {PostsModel} from "../../db/MongoDB";
import {injectable} from "inversify";


@injectable()
export class PostsRepository {

    async save (post: PostsInstanceType): Promise<PostsInstanceType> {
        return post.save()
    }

    async findById (postId: string): Promise<PostsInstanceType | null> {

        return await PostsModel.findOne({id: postId})
    }

    async delete(id: string): Promise<boolean> {

        const result = await PostsModel.deleteOne({id: id})
        return result.deletedCount !== 0
    }
}

