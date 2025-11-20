import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import format from 'pg-format';
import {
  AccessTokenPayloadType,
  MyInfoType,
  UserPagesType,
  UserQueryType,
  UserViewType,
} from '../../../Types/Types';
import { mapToView } from '../../../Core/helper';

@Injectable()
export class UserSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findUserById(id: string): Promise<UserViewType | null> {
    const result = await this.dataSource.query(
      `
        SELECT * 
        FROM "user" u
        WHERE u.id = $1
        `,
      [id],
    );
    if (result.length === 0) {
      return null;
    }
    return mapToView.mapUser(result[0]);
  }

  async findManyUsersByLoginOrEmail(
    sanitizedQuery: UserQueryType,
  ): Promise<UserPagesType | null> {
    const beforeQuery = format(
      `
           SELECT *
        FROM "user" u
        WHERE u.login ILIKE $1 OR u.email ILIKE $2
        ORDER BY %I %s
        LIMIT $3
        OFFSET $4
    `,
      sanitizedQuery.sortBy,
      sanitizedQuery.sortDirection,
    );

    const offsetValue: number =
      (sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize;
    const result = await this.dataSource.query(beforeQuery, [
      sanitizedQuery.searchLoginTerm,
      sanitizedQuery.searchEmailTerm,
      sanitizedQuery.pageSize,
      offsetValue,
    ]);

    const dbCount = await this.dataSource.query(
      `
        SELECT COUNT(*)
        FROM "user"
        `,
    );
    const totalCount: number = Number(dbCount[0].count);
    const mappedUsers: UserViewType[] = mapToView.mapUsers(result);
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
    const result = await this.dataSource.query(
      `
        SELECT u.email, u.login, u.id as userId
        FROM "user" u
        WHERE u.id = $1
        `,
      [user.sub],
    );
    if (result.length === 0) {
      return null;
    }
    // const mappedUser: MyInfoType = {
    //   email: result.email,
    //   login: result.login,
    //   userId: result.id,
    // };

    return result[0];
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
