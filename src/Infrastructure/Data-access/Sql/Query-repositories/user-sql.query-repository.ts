import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  AccessTokenPayloadType,
  MyInfoType,
  UserPagesType,
  UserQueryType,
  UserViewType,
} from '../../../../Domain/Types/Types';
import { UserTypeormEntity } from '../Entities/user-typeorm.entity';
import { mapToView } from '../../../Mapper/view-model.mapper';

@Injectable()
export class UserSqlQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(UserTypeormEntity)
    protected userRepository: Repository<UserTypeormEntity>,
  ) {}

  async findUserById(id: string): Promise<UserViewType | null> {
    const result: UserTypeormEntity | null =
      await this.userRepository.findOneBy({
        id: id,
      });
    if (!result) {
      return null;
    }
    return mapToView.mapUser(result);
  }

  async findManyUsersByLoginOrEmail(
    sanitizedQuery: UserQueryType,
  ): Promise<UserPagesType | null> {
    const offsetValue: number =
      (sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize;
    const [items, totalCount] = await this.userRepository
      .createQueryBuilder('u')
      .where('u.login ILIKE :loginTerm OR u.email ILIKE :emailTerm', {
        loginTerm: sanitizedQuery.searchLoginTerm
          ? `%${sanitizedQuery.searchLoginTerm}%`
          : '%%',
        emailTerm: sanitizedQuery.searchEmailTerm
          ? `%${sanitizedQuery.searchEmailTerm}%`
          : '%%',
      })
      .orderBy(
        `u.${sanitizedQuery.sortBy}`,
        `${(sanitizedQuery.sortDirection as 'ASC') || 'DESC'}`,
      )
      .take(sanitizedQuery.pageSize)
      .skip(offsetValue)
      .getManyAndCount();

    const mappedUsers: UserViewType[] = mapToView.mapUsers(items);
    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedUsers,
    };
  }

  // async findUserByLoginOrEmail(
  //   loginOrEmail: string,
  // ): Promise<UserViewType | null> {
  //   return await this.UserModel.findOne({
  //     $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
  //   });
  // }

  async getMyInfo(user: AccessTokenPayloadType): Promise<MyInfoType | null> {
    const result: UserTypeormEntity | null =
      await this.userRepository.findOneBy({
        id: user.sub,
      });
    if (!result) {
      return null;
    }

    return mapToView.mapMyInfo(result);
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
