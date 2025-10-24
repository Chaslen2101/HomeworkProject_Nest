import {Request, Response} from "express";
import {httpStatuses} from "../settings";
import {PostsQueryRep} from "../Infrastructure/QueryRep/postsQueryRep";
import {BlogsQueryRep} from "../Infrastructure/QueryRep/blogsQueryRep";
import {
    AccessTokenPayloadType,
    InputQueryType,
    PostsPagesType,
    PostsViewType
} from "../Types/Types";
import {PostsService} from "../Application/Services/postsServices";
import {inject} from "inversify";
import {jwtService} from "../Infrastructure/Features/GlobalFeatures/jwtService";


export class PostsController {

    constructor(
        @inject(PostsQueryRep) protected postsQueryRep: PostsQueryRep,
        @inject(BlogsQueryRep) protected blogsQueryRep: BlogsQueryRep,
        @inject(PostsService) protected postsService: PostsService
    ) {
    }

    async returnAllPosts(req: Request, res: Response) {

        const isTokenExist: AccessTokenPayloadType | null = req.headers.authorization ? await jwtService.verifyAccessToken(req.headers.authorization.split(" ")[1]) : null
        const userId: string = isTokenExist ? isTokenExist.id : ""

        const posts: PostsPagesType = await this.postsQueryRep.findManyPosts(req.query as InputQueryType, userId)
        res
            .status(httpStatuses.OK_200)
            .json(posts)
    }

    async createPost(req: Request, res: Response) {

        try {
            const isTokenExist: AccessTokenPayloadType | null = req.headers.authorization ? await jwtService.verifyAccessToken(req.headers.authorization.split(" ")[1]) : null
            const userId: string = isTokenExist ? isTokenExist.id : ""

            const createdPostId: string = await this.postsService.createPost(req.body)
            const createdPost: PostsViewType | null = await this.postsQueryRep.findPostById(createdPostId, userId)
            res
                .status(httpStatuses.CREATED_201)
                .json(createdPost)

        } catch (e) {

            if (e instanceof Error) {
                if (e.message === "Cant find needed blog") {}
                res
                    .status(httpStatuses.BAD_REQUEST_400)
                    .json({})
            }
        }
    }

    async findPostById(req: Request, res: Response) {

        const isTokenPassed: AccessTokenPayloadType | null = req.headers.authorization ? await jwtService.verifyAccessToken(req.headers.authorization.split(' ')[1]) : null
        const userId: string = isTokenPassed ? isTokenPassed.id : ""

        const neededPost: PostsViewType | null = await this.postsQueryRep.findPostById(req.params.id, userId)
        if (neededPost) {
            res
                .status(httpStatuses.OK_200)
                .json(neededPost)
        } else {
            res
                .status(httpStatuses.NOT_FOUND_404)
                .json({})
        }
    }

    async updatePostByID(req: Request, res: Response) {

        const isUpdated: boolean = await this.postsService.updatePost(req.params.id, req.body)
        if (!isUpdated) {
            res
                .status(httpStatuses.NOT_FOUND_404)
                .json({})
        } else {
            res
                .status(httpStatuses.NO_CONTENT_204)
                .json({})
        }
    }

    async deletePostById(req: Request, res: Response) {

        try {
            await this.postsService.deletePost(req.params.id)
            res
                .status(httpStatuses.NO_CONTENT_204)
                .json({})

        } catch (e) {

            if (e instanceof Error) {
                if (e.message === "Cant find needed post") {
                    res
                        .status(httpStatuses.NOT_FOUND_404)
                        .json({})
                }
            }
        }
    }

    async updateLikeStatus(req: Request, res: Response) {

        try {

            await this.postsService.updateLikeStatus(req.params.postId, req.body.likeStatus, req.user)

            res
                .status(httpStatuses.NO_CONTENT_204)
                .json({})

        } catch (e) {

            if (e instanceof Error) {

                if (e.message === "Cant find needed post") {
                    res
                        .status(httpStatuses.NOT_FOUND_404)
                        .json({})
                }

                if (e.message === "Invalid like status") {
                    res
                        .status(httpStatuses.BAD_REQUEST_400)
                        .json({})
                }
            }
        }
    }
}