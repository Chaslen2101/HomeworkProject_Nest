import {
    BlogsDBType,
    BlogsPagesType,
    BlogsPostsQueryType,
    BlogsViewType,
    InputQueryType
} from "../../Types/Types";
import {mapToView, queryHelper} from "../Features/GlobalFeatures/helper";
import {BlogsModel} from "../../db/MongoDB";
import {injectable} from "inversify";


@injectable()
export class BlogsQueryRep {

    async findManyBlogs(query: InputQueryType): Promise<BlogsPagesType> {

        const sanitizedQuery: BlogsPostsQueryType = queryHelper.blogsPostsQuery(query)
        const filter = sanitizedQuery.searchNameTerm ? {name: {$regex: sanitizedQuery.searchNameTerm, $options: "i"}} : {}

        const items: BlogsDBType[] | null = await BlogsModel.find(filter, {projection: {_id: 0}})
            .sort({[sanitizedQuery.sortBy]: sanitizedQuery.sortDirection})
            .skip((sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize)
            .limit(sanitizedQuery.pageSize)
            .lean()
        const totalCount: number = await BlogsModel.countDocuments(filter)

        const mappedBlogs: BlogsViewType[] = mapToView.mapBlogs(items)

        return {
            pagesCount: Math.ceil(totalCount/sanitizedQuery.pageSize),
            page: sanitizedQuery.pageNumber,
            pageSize: sanitizedQuery.pageSize,
            totalCount: totalCount,
            items: mappedBlogs
        }
    }

    async findBlogByID(id: string): Promise<BlogsViewType | null> {

        const notMappedBlog: BlogsDBType | null = await BlogsModel.findOne({id: id}, {projection: {_id: 0}}).lean()
        if (!notMappedBlog) {return null}

        return mapToView.mapBlog(notMappedBlog)
    }
}