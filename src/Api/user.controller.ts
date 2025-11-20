import type {
  InputQueryType,
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
  UseGuards,
} from '@nestjs/common';
import { UserQueryRep } from '../Infrastructure/Query-repositories/user.query-repository';
import { UserService } from '../Application/user.service';
import { BasicGuard } from './Guards/Basic/basic.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from 'src/Application/UseCases/Auth/registration.usecase';
import { RegistrationInputDTO } from 'src/Api/Input-dto/auth.input-dto';
import { UserSqlQueryRepository } from 'src/Infrastructure/Query-repositories/SQL/user-sql.query-repository';
import { queryHelper } from 'src/Core/helper';

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
    const sanitizedQuery: UserQueryType = queryHelper.userQuery(query);
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
