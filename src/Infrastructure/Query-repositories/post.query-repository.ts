import {
    BlogsPostsQueryType,
    InputQueryType,
    PostsPagesType,
    PostsDBType,
    PostsViewType
} from "../../Types/Types";
import {mapToView, queryHelper} from "../Features/GlobalFeatures/helper";
import {PostsModel} from "../../db/MongoDB";
import {injectable} from "inversify";


@injectable()
export class PostsQueryRep {

    async findManyPosts (query:InputQueryType, userId: string, id?: string, ): Promise<PostsPagesType> {

        const sanitizedQuery: BlogsPostsQueryType = queryHelper.blogsPostsQuery(query)
        const filter: {blogId:string} | {} = query.blogId ? {blogId: query.blogId} : id ? {blogId: id} : {}

        const items: PostsDBType[] = await PostsModel.find(filter, {projection: {_id: 0}})
            .sort({[sanitizedQuery.sortBy]: sanitizedQuery.sortDirection})
            .limit(sanitizedQuery.pageSize)
            .skip((sanitizedQuery.pageNumber-1)*sanitizedQuery.pageSize).lean()
        const totalCount: number = await PostsModel.countDocuments(filter)

        const mappedPosts: PostsViewType[] = mapToView.mapPosts(items, userId)

        return {
            pagesCount: Math.ceil(totalCount/sanitizedQuery.pageSize),
            page: sanitizedQuery.pageNumber,
            pageSize: sanitizedQuery.pageSize,
            totalCount: totalCount,
            items: mappedPosts
        }
    }

    async findPostById(postId: string, userId: string): Promise<PostsViewType | null> {

        const notMappedPost: PostsDBType | null = await PostsModel.findOne({id: postId}).lean()
        if (!notMappedPost) {return null}
        return mapToView.mapPost(notMappedPost, userId)
    }
}