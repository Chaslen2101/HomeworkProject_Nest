import type {
  InputQueryType,
  UserInputType,
  UserQueryType,
  UserPagesType,
  UserViewType,
} from '../Types/Types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserQueryRep } from '../Infrastructure/Query-repositories/user.query-repository';
import { UserService } from '../Application/user.service';
import { queryHelper } from '../Application/helper';
import { ObjectId } from 'mongodb';

@Controller('users')
export class UserController {
  constructor(
    @Inject(UserService) protected userService: UserService,
    @Inject(UserQueryRep) protected userQueryRep: UserQueryRep,
  ) {}

  @Post()
  @HttpCode(201)
  async createUser(
    @Body() reqBody: UserInputType,
  ): Promise<UserViewType | null> {
    const newUserId: ObjectId = await this.userService.createUser(reqBody);

    return await this.userQueryRep.findUserById(newUserId);
  }

  @Get()
  @HttpCode(200)
  async getManyUsers(
    @Query() query: InputQueryType,
  ): Promise<UserPagesType | null> {
    const sanitizedQuery: UserQueryType = queryHelper.userQuery(query);
    return await this.userQueryRep.findManyUsersByLoginOrEmail(sanitizedQuery);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') userId: string): Promise<void> {
    const isDeleted: boolean = await this.userService.deleteUser(userId);
    if (!isDeleted) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }
}
