import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../Infrastructure/Repositories/user.repository';
import { hashHelper } from '../Core/helper';
import { User, UserDocumentType } from '../Domain/user.entity';
import type { UserModelType } from '../Domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { UserSqlRepository } from 'src/Infrastructure/Repositories/SQL/user-sql.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserSqlRepository) protected userRepository: UserSqlRepository,
  ) {}

  // async createUser(newUserData: CreateUserInputDTO): Promise<string> {
  //   const hashedPassword: string = await hashHelper.hash(newUserData.password);
  //   const newUser: UserDocumentType = this.UserModel.createNew(
  //     newUserData,
  //     hashedPassword,
  //   );
  //   console.log(newUser.password);
  //   await this.userRepository.save(newUser);
  //   return newUser._id.toString();
  // }
  //
  async deleteUser(userId: string) {
    return await this.userRepository.deleteUser(userId);
  }
}
