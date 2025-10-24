import {CommentsInstanceType} from "../../Types/Types";
import {CommentsModel} from "../../db/MongoDB";
import {injectable} from "inversify";


@injectable()
export class CommentsRepository {

    async save(comment: CommentsInstanceType) {
        return await comment.save()
    }

    async findById(id: string): Promise<CommentsInstanceType | null> {
        return CommentsModel.findOne({id: id})
    }

    async deleteComment(id: string): Promise<boolean> {

        const result = await CommentsModel.deleteOne({id: id})
        return result.deletedCount === 1
    }
}
