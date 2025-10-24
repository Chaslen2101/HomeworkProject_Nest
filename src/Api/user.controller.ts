import {Request, Response} from "express"
import {InputQueryType, UserInputType, UserQueryType, UserViewType} from "../Types/Types";
import {UsersQueryRep} from "../Infrastructure/QueryRep/usersQueryRep";
import {httpStatuses} from "../settings";
import {queryHelper} from "../Infrastructure/Features/GlobalFeatures/helper";
import {UsersService} from "../Application/Services/usersServices";
import {inject} from "inversify";


export class UsersController {

    constructor(
        @inject(UsersQueryRep) protected usersQueryRep: UsersQueryRep,
        @inject(UsersService) protected usersService: UsersService
    ) {}

    async createUser (req: Request<{}, {}, UserInputType>, res: Response)  {
        const newUserId: string = await this.usersService.createUser(req.body)
        const newUser: UserViewType | null = await this.usersQueryRep.findUserById(newUserId)
        res
            .status(httpStatuses.CREATED_201)
            .json(newUser)
    }

    async getManyUsers (req: Request, res: Response) {

        const sanitizedQuery: UserQueryType = queryHelper.userQuery(req.query as InputQueryType)
        res
            .status(httpStatuses.OK_200)
            .json(await this.usersQueryRep.findManyUsersByLoginOrEmail(sanitizedQuery))
    }

    async deleteUser (req: Request, res: Response) {

        const isDeleted: boolean = await this.usersService.deleteUser(req.params.id)
        if (isDeleted) {
            res
                .status(httpStatuses.NO_CONTENT_204)
                .json({})
        } else {
            res
                .status(httpStatuses.NOT_FOUND_404)
                .json({})
        }
    }
}

