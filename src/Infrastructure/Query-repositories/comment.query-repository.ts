import {CommentsModel} from "../../db/MongoDB";
import {CommentsPagesType, CommentsQueryType, CommentsDBType, CommentsViewType} from "../../Types/Types";
import {injectable} from "inversify";
import {mapToView} from "../Features/GlobalFeatures/helper";


@injectable()
export class CommentsQueryRep {

    async findCommentById (id: string, userId: string): Promise<CommentsViewType | null> {

        const comment: CommentsDBType | null = await CommentsModel.findOne({id: id}, {projection: {_id: 0}}).lean()
        if (!comment) {return null}
        return mapToView.mapComment(comment, userId);
    }

    async findManyCommentsByPostId (postId: string, query: CommentsQueryType, userId: string): Promise<CommentsPagesType> {

        const items = await CommentsModel.find({postId: postId}, {projection:{_id: 0}})
            .sort({[query.sortBy]: query.sortDirection})
            .limit(query.pageSize)
            .skip((query.pageNumber - 1)* query.pageSize)
            .lean()
        const totalCount: number = await CommentsModel.countDocuments({postId: postId})
        const mappedComments: CommentsViewType[] = mapToView.mapComments(items, userId)
        return {
            pagesCount: Math.ceil(totalCount/query.pageSize),
            page: query.pageNumber,
            pageSize: query.pageSize,
            totalCount: totalCount,
            items: mappedComments
        }
    }
}