import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocumentType } from '../../Domain/user.schema';
import type { UserModelType } from '../../Domain/user.schema';
import {
  UserQueryType,
  UserPagesType,
  UserViewType,
  MyInfoType,
  AccessTokenPayloadType,
} from '../../Types/Types';
import { mapToView } from '../../Core/helper';
import { SortDirection } from 'mongodb';

@Injectable()
export class UserQueryRep {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findUserById(id: string): Promise<UserViewType | null> {
    const notMappedUser: UserDocumentType | null = await this.UserModel.findOne(
      {
        _id: id,
      },
    );
    if (!notMappedUser) {
      return null;
    }
    return mapToView.mapUser(notMappedUser);
  }

  async findManyUsersByLoginOrEmail(
    sanitizedQuery: UserQueryType,
  ): Promise<UserPagesType | null> {
    let filter = {};
    if (sanitizedQuery.searchLoginTerm && sanitizedQuery.searchEmailTerm) {
      filter = {
        $or: [
          { email: { $regex: sanitizedQuery.searchEmailTerm, $options: 'i' } },
          { login: { $regex: sanitizedQuery.searchLoginTerm, $options: 'i' } },
        ],
      };
    } else if (
      !sanitizedQuery.searchLoginTerm &&
      sanitizedQuery.searchEmailTerm
    ) {
      filter = {
        email: { $regex: sanitizedQuery.searchEmailTerm, $options: 'i' },
      };
    } else if (
      !sanitizedQuery.searchEmailTerm &&
      sanitizedQuery.searchLoginTerm
    ) {
      filter = {
        login: { $regex: sanitizedQuery.searchLoginTerm, $options: 'i' },
      };
    }

    const items: UserDocumentType[] = await this.UserModel.find(filter, {
      projection: { _id: 0 },
    })
      .sort({
        [sanitizedQuery.sortBy]: sanitizedQuery.sortDirection as SortDirection,
      })
      .limit(sanitizedQuery.pageSize)
      .skip((sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize);
    const totalCount: number = await this.UserModel.countDocuments(filter);
    const mappedUsers: UserViewType[] = mapToView.mapUsers(items);
    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedUsers,
    };
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserViewType | null> {
    return await this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async getMyInfo(user: AccessTokenPayloadType): Promise<boolean | MyInfoType> {
    const userDocument: UserDocumentType | null = await this.UserModel.findById(
      user.sub,
    );
    if (!userDocument) {
      return false;
    }
    const mappedUser: MyInfoType = {
      email: userDocument.email,
      login: userDocument.login,
      userId: userDocument._id.toString(),
    };

    return mappedUser;
  }
}

// async findUserByEmailConfirmCode(code: string): Promise<UserViewType | null> {
//   const notMappedUser: UserDocumentType | null = await this.UserModel.findOne(
//     { 'emailConfirmationInfo.confirmationCode': code },
//     { projection: { _id: 0 } },
//   );
//   if (!notMappedUser) {
//     return null;
//   }
//   return mapToView.mapUser(notMappedUser);
// }

//   async findUserByPasswordRecoveryCode(
//     code: string,
//   ): Promise<UserViewType | null> {
//     const notMappedUser: UserDocumentType | null = await this.UserModel.findOne(
//       { 'passwordRecoveryCode.confirmationCode': code },
//       { projection: { _id: 0 } },
//     );
//     if (!notMappedUser) {
//       return null;
//     }
//     return mapToView.mapUser(notMappedUser);
//   }
