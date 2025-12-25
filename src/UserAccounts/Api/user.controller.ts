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
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../Application/user.service';
import { BasicGuard } from '../../Common/Guards/basic.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UserSqlQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/user-sql.query-repository';
import { RegistrationInputDTO } from './InputDTOValidators/auth.input-dto.validator';
import { RegistrationCommand } from '../Application/UseCases/Auth/registration.usecase';
import { UserQueryType } from './Types/user-account.input-query.types';
import {
  UserPagesType,
  UserViewType,
} from './Types/user-account.view-model.types';
import type { InputQueryType } from '../../Common/Types/input-query.types';
import { userAccountQueryHelper } from './Helpers/user-account.query.helper';

@Controller('sa/users')
export class UserController {
  constructor(
    @Inject(UserService) protected userService: UserService,
    @Inject(UserSqlQueryRepository)
    protected userQueryRep: UserSqlQueryRepository,
    @Inject(CommandBus) protected commandBus: CommandBus,
  ) {}

  @Post()
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createUser(
    @Body() reqBody: RegistrationInputDTO,
  ): Promise<UserViewType | null> {
    const newUserId: string = await this.commandBus.execute(
      new RegistrationCommand(reqBody),
    );

    return await this.userQueryRep.findUserById(newUserId);
  }

  @Get()
  @UseGuards(BasicGuard)
  @HttpCode(200)
  async getManyUsers(
    @Query() query: InputQueryType,
  ): Promise<UserPagesType | null> {
    const sanitizedQuery: UserQueryType =
      userAccountQueryHelper.userQuery(query);
    return await this.userQueryRep.findManyUsersByLoginOrEmail(sanitizedQuery);
  }

  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async deleteUser(@Param('id') userId: string): Promise<void> {
    const isDeleted: boolean = await this.userService.deleteUser(userId);
    if (!isDeleted) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }
}
