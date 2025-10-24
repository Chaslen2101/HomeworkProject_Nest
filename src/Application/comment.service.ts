import {
    CommentsInstanceType,
    PostsInstanceType,
    UserViewType
} from "../../Types/Types";
import {CommentsRepository} from "../../Infrastructure/Repository/commentsRepository";
import {inject, injectable} from "inversify";
import {PostsRepository} from "../../Infrastructure/Repository/postsRepository";


@injectable()
export class CommentsService {

    constructor(
        @inject(CommentsRepository) protected commentsRepository: CommentsRepository,
        @inject(PostsRepository) protected postsRepository: PostsRepository
    ) {
    }

    async createComment(content: string, userInfo: UserViewType, postId: string): Promise<string> {

        const neededPost: PostsInstanceType | null = await this.postsRepository.findById(postId)
        if (!neededPost) {throw new Error("Cant find needed post")}

        const newComment: CommentsInstanceType = neededPost.createComment(content,userInfo)

        await this.commentsRepository.save(newComment)
        await this.postsRepository.save(neededPost)
        return newComment.id
    }

    async updateComment(newCommentContent: string, commentId: string, userId: string): Promise<boolean> {

        const neededComment: CommentsInstanceType | null = await this.commentsRepository.findById(commentId)
        if(!neededComment) {throw new Error("Cant find needed comment")}
        if(neededComment.commentatorInfo.userId !== userId) {throw new Error("You cant update foreign comment")}

        neededComment.updateCommentContent(newCommentContent)

        await this.commentsRepository.save(neededComment)
        return true
    }

    async deleteComment(commentId: string, userId: string): Promise<boolean> {

        const neededComment: CommentsInstanceType | null = await this.commentsRepository.findById(commentId)
        if (!neededComment) {throw new Error("Cant find needed comment")}
        if (neededComment.commentatorInfo.userId !== userId) {throw new Error("You cant delete foreign comment")}

        const neededPost: PostsInstanceType | null = await this.postsRepository.findById(neededComment.postId)
        if (!neededPost) {throw new Error("Comment has invalid postId")}
        neededPost.deleteComment(commentId)

        return this.commentsRepository.deleteComment(commentId)
    }

    async updateLikeStatus(commentId: string, likeStatus: string, userId: string): Promise<boolean> {

        const neededPost: CommentsInstanceType | null = await this.commentsRepository.findById(commentId)
        if(!neededPost) {throw new Error("Cant find needed comment")}

        const isUpdated: boolean = neededPost.updateLikeStatus(likeStatus, userId)
        if(!isUpdated) {throw new Error("Invalid like status")}

        await this.commentsRepository.save(neededPost)
        return true
    }
}
