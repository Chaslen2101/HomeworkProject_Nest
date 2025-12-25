import { Inject, Injectable } from '@nestjs/common';
import { UserSqlRepository } from '../Infrastructure/Data-access/Sql/Repositories/user-sql.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserSqlRepository) protected userRepository: UserSqlRepository,
  ) {}

  async deleteUser(userId: string) {
    return await this.userRepository.deleteUser(userId);
  }
}
