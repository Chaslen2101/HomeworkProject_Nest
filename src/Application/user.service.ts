import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../Infrastructure/Repositories/user.repository';
import { hashHelper } from '../Core/helper';
import { User, UserDocumentType } from '../Domain/user.schema';
import type { UserModelType } from '../Domain/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { CreateUserInputDTO } from '../Api/Input-dto/user.input-dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository) protected userRepository: UserRepository,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}

  async createUser(newUserData: CreateUserInputDTO): Promise<ObjectId> {
    const hashedPassword: string = await hashHelper.hashNewPassword(
      newUserData.password,
    );
    const newUser: UserDocumentType = this.UserModel.createNewUser(
      newUserData,
      hashedPassword,
    );
    await this.userRepository.save(newUser);
    return newUser._id;
  }

  async deleteUser(id: string) {
    return await this.userRepository.deleteUser(id);
  }
}
