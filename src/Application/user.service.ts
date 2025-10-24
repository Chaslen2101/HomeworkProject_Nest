import {UserInputType, UserInstanceType} from "../../Types/Types";
import {UsersRepository} from "../../Infrastructure/Repository/usersRepository";
import {inject, injectable} from "inversify";
import {hashHelper} from "../../Infrastructure/Features/GlobalFeatures/helper";
import {UsersModel} from "../../db/MongoDB";


@injectable()
export class UsersService {

    constructor(
        @inject(UsersRepository) protected usersRepository: UsersRepository
    ) {}

    async createUser (newUserData: UserInputType): Promise<string> {

        const hashedPassword: string = await hashHelper.hashNewPassword(newUserData.password)
        const newUser: UserInstanceType = await UsersModel.createNewUser(newUserData, hashedPassword)
        await this.usersRepository.save(newUser)
        return newUser.id
    }

    async deleteUser (id: string) {
        return await this.usersRepository.deleteUser(id)
    }
}

