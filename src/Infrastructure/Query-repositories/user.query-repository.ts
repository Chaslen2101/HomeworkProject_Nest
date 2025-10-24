import {UsersModel} from "../../db/MongoDB";
import {UsersPagesType, UserDBType, UserQueryType, UserViewType} from "../../Types/Types";
import {mapToView} from "../Features/GlobalFeatures/helper";
import {injectable} from "inversify";


@injectable()
export class UsersQueryRep {

    async findUserByLoginOrEmail (loginOrEmail: string): Promise<UserDBType | null> {
        return await UsersModel.findOne({$or: [{login: loginOrEmail}, {email: loginOrEmail}]}, {projection: {_id: 0}}).lean();
    }

    async findUserById (id: string): Promise<UserViewType | null> {

        const notMappedUser: UserDBType | null = await UsersModel.findOne({id: id,},{projection: {_id: 0}}).lean()
        if(!notMappedUser) {return null}
        return mapToView.mapUser(notMappedUser)
    }

    async findManyUsersByLoginOrEmail (sanitizedQuery: UserQueryType): Promise<UsersPagesType | null> {

        let filter = {}
        if (sanitizedQuery.searchLoginTerm && sanitizedQuery.searchEmailTerm) {
            filter = {$or:[{email:{$regex: sanitizedQuery.searchEmailTerm, $options: "i"}},{login:{$regex: sanitizedQuery.searchLoginTerm, $options:"i"}}]}
        }else if (!sanitizedQuery.searchLoginTerm && sanitizedQuery.searchEmailTerm) {
            filter = {email:{$regex: sanitizedQuery.searchEmailTerm, $options: "i"}}
        }else if (!sanitizedQuery.searchEmailTerm && sanitizedQuery.searchLoginTerm) {
            filter = {login:{$regex: sanitizedQuery.searchLoginTerm, $options:"i"}}
        }

        const items: UserDBType[] = await UsersModel.find(filter,{projection: {_id: 0}})
            .sort({[sanitizedQuery.sortBy]: sanitizedQuery.sortDirection})
            .limit(sanitizedQuery.pageSize)
            .skip((sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize)
            .lean()
        const totalCount: number = await UsersModel.countDocuments(filter)
        const users: UserViewType[] = mapToView.mapUsers(items)
        return {
            pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
            page: sanitizedQuery.pageNumber,
            pageSize: sanitizedQuery.pageSize,
            totalCount: totalCount,
            items: users
        }
    }

    async findUserByEmailConfirmCode (code: string): Promise<UserViewType | null> {

        const notMappedUser: UserDBType | null = await UsersModel.findOne({"emailConfirmationInfo.confirmationCode": code},{projection:{_id:0}}).lean()
        if(!notMappedUser) {return null}
        return mapToView.mapUser(notMappedUser)
    }

    async findUserByPasswordRecoveryCode (code: string): Promise<UserViewType | null> {

        const notMappedUser: UserDBType | null = await UsersModel.findOne({"passwordRecoveryCode.confirmationCode": code},{projection:{_id:0}}).lean()
        if(!notMappedUser) {return null}
        return mapToView.mapUser(notMappedUser)
    }
}

