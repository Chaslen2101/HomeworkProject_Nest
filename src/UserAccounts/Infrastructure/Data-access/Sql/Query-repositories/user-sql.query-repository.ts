import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserTypeormEntity } from '../Entities/user.typeorm-entity';
import { MapToViewUserAccount } from '../../../Mappers/user-account-view-model.mapper';
import { UserQueryType } from '../../../../Api/Types/user-account.input-query.types';
import {
  MyInfoType,
  UserPagesType,
  UserViewType,
} from '../../../../Api/Types/user-account.view-model.types';
import { AccessTokenPayloadType } from '../../../../../Common/Types/auth-payloads.types';

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
    return MapToViewUserAccount.mapUser(result);
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

    const mappedUsers: UserViewType[] = MapToViewUserAccount.mapUsers(items);
    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedUsers,
    };
  }

  async getMyInfo(user: AccessTokenPayloadType): Promise<MyInfoType | null> {
    const result: UserTypeormEntity | null =
      await this.userRepository.findOneBy({
        id: user.sub,
      });
    if (!result) {
      return null;
    }

    return MapToViewUserAccount.mapMyInfo(result);
  }
}
