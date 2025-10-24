import {UsersModel} from "../../db/MongoDB";
import {add} from "date-fns"
import {injectable} from "inversify";
import {UserInstanceType} from "../../Types/Types";


@injectable()
export class UsersRepository {


    async save (newUser: UserInstanceType): Promise<UserInstanceType> {
        return await newUser.save()
    }

    async findByUserId(id: string): Promise<UserInstanceType | null> {
        return await UsersModel.findOne({id: id}, {prejection: {_id: 0}})
    }

    async findByEmailConfirmCode(id: string): Promise<UserInstanceType | null> {
        return await UsersModel.findOne({"emailConfirmationInfo.confirmationCode": id}, {prejection: {_id: 0}})
    }

    async findByPasswordConfirmCode(id: string): Promise<UserInstanceType | null> {
        return await UsersModel.findOne({"emailConfirmationInfo.confirmationCode": id}, {prejection: {_id: 0}})
    }

    async deleteUser (id: string): Promise<boolean> {

        const result = await UsersModel.deleteOne({id: id})
        return result.deletedCount !== 0
    }

    async confirmEmail (userId:string): Promise<boolean> {

        const result = await UsersModel.updateOne(
            {id: userId},
            {$set:{"emailConfirmationInfo.isConfirmed": true}}
        )
        return result.modifiedCount === 1
    }

    async changeEmailConfirmCode (code: string, userId: string): Promise<boolean> {

        const result = await UsersModel.updateOne(
            {id: userId},
            {$set:{"emailConfirmationInfo.confirmationCode": code}}
        )
        return result.modifiedCount === 1
    }

    async changePasswordConfirmCode (code: string, userId: string): Promise<boolean> {

        const expirationDate: string = add(new Date(),{hours: 1}).toISOString()
        const result = await UsersModel.updateOne(
            {id: userId},
            {$set:
                        {"passwordRecoveryCode.confirmationCode": code,
                         "passwordRecoveryCode.expirationDate": expirationDate},
            }
        )
        return result.modifiedCount === 1
    }

    async changePassword (newPassword: string, userId: string): Promise<boolean> {

        const result = await UsersModel.updateOne(
            {id: userId},
            {$set:{password:newPassword}}
        )

        return result.modifiedCount === 1
    }
}

