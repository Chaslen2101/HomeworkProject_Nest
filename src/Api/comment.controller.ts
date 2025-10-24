import {Request, Response} from "express"
import {PostsQueryRep} from "../Infrastructure/QueryRep/postsQueryRep";
import {httpStatuses} from "../settings";
import {CommentsService} from "../Application/Services/commentsService";
import {CommentsQueryRep} from "../Infrastructure/QueryRep/commentsQueryRep";
import { queryHelper} from "../Infrastructure/Features/GlobalFeatures/helper";
import {
    AccessTokenPayloadType,
    CommentsPagesType,
    CommentsQueryType,
    CommentsViewType,
    InputQueryType, PostsViewType
} from "../Types/Types";
import {inject} from "inversify";
import {jwtService} from "../Infrastructure/Features/GlobalFeatures/jwtService";


export class CommentsController {

    constructor(
        @inject(PostsQueryRep) protected postsQueryRep: PostsQueryRep,
        @inject(CommentsQueryRep) protected commentsQueryRep: CommentsQueryRep,
        @inject(CommentsService) protected commentsService: CommentsService,
    ) {
    }

    async createCommentForPost(req: Request, res: Response) {

        try {
            const newCommentId: string = await this.commentsService.createComment(req.body.content, req.user, req.params.postId)
            const newComment: CommentsViewType | null = await this.commentsQueryRep.findCommentById(newCommentId, req.user.id)

            res
                .status(httpStatuses.CREATED_201)
                .json(newComment)

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

    async getCommentsForPost(req: Request, res: Response) {

        const isTokenPassed: AccessTokenPayloadType | null = req.headers.authorization ? await jwtService.verifyAccessToken(req.headers.authorization.split(' ')[1]) : null
        let userId: string = isTokenPassed ? isTokenPassed.id : ""

        const isPostExists: PostsViewType | null = await this.postsQueryRep.findPostById(req.params.postId, userId)
        if (!isPostExists) {
            res
                .status(httpStatuses.NOT_FOUND_404)
                .json({})
            return
        }

        const sanitizedQuery: CommentsQueryType = queryHelper.commentsQuery(req.query as InputQueryType)
        const commentsToView: CommentsPagesType = await this.commentsQueryRep.findManyCommentsByPostId(req.params.postId, sanitizedQuery, userId)

        res
            .status(httpStatuses.OK_200)
            .json(commentsToView)
    }

    async getCommentById(req: Request, res: Response) {

        const isTokenPassed: AccessTokenPayloadType | null = req.headers.authorization ? await jwtService.verifyAccessToken(req.headers.authorization.split(' ')[1]) : null
        let userId: string = isTokenPassed ? isTokenPassed.id : ""

        const neededComment: CommentsViewType | null = await this.commentsQueryRep.findCommentById(req.params.id, userId)

        if (!neededComment) {
            res
                .status(httpStatuses.NOT_FOUND_404)
                .json({})
        }

        res
            .status(httpStatuses.OK_200)
            .json(neededComment)

    }

    async updateCommentById(req: Request, res: Response) {

        try {

            await this.commentsService.updateComment(req.body.content, req.params.commentId, req.user.id)
            res
                .status(httpStatuses.NO_CONTENT_204)
                .json({})

        } catch (e) {

            if (e instanceof Error) {
                if (e.message === "Cant find needed comment") {
                    res
                        .status(httpStatuses.NOT_FOUND_404)
                        .json({})
                }

                if (e.message === "You cant update foreign comment") {
                    res
                        .status(httpStatuses.FORBIDDEN_403)
                        .json({})
                }
            }
        }
    }

    async deleteCommentById(req: Request, res: Response) {

        try {

            await this.commentsService.deleteComment(req.params.commentId, req.user.id)
            res
                .status(httpStatuses.NO_CONTENT_204)
                .json({})

        } catch (e) {

            if (e instanceof Error) {
                if (e.message === "Cant find needed comment") {
                    res
                        .status(httpStatuses.NOT_FOUND_404)
                        .json({})
                }

                if (e.message === "You cant delete foreign comment") {
                    res
                        .status(httpStatuses.FORBIDDEN_403)
                        .json({})
                }
            }

        }
    }

    async updateLikeStatus(req: Request, res: Response) {

        try {

            await this.commentsService.updateLikeStatus(req.params.commentId, req.body.likeStatus, req.user.id)

            res
                .status(httpStatuses.NO_CONTENT_204)
                .json({})

        } catch (e) {

            if (e === "Cant find needed comment") {
                res
                    .status(httpStatuses.NOT_FOUND_404)
                    .json({})
            }

            if (e === "Invalid like status") {
                res
                    .status(httpStatuses.BAD_REQUEST_400)
                    .json({
                        message: e,
                        field: "likeStatus"
                    })
            }
        }
    }
}
