import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserTypeormEntity } from '../Infrastructure/Data-access/Sql/Entities/user-typeorm.entity';
import { SessionTypeormEntity } from '../Infrastructure/Data-access/Sql/Entities/session-typeorm.entity';
import { EmailConfirmInfoTypeormEntity } from '../Infrastructure/Data-access/Sql/Entities/emailConfirmInfo-typeorm.entity';
import { PasswordRecoveryInfoTypeormEntity } from '../Infrastructure/Data-access/Sql/Entities/passwordRecoveryInfo-typeorm.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(UserTypeormEntity)
    protected userRepository: Repository<UserTypeormEntity>,
    @InjectRepository(SessionTypeormEntity)
    protected sessionRepository: Repository<SessionTypeormEntity>,
    @InjectRepository(EmailConfirmInfoTypeormEntity)
    protected emailConfirmRepository: Repository<EmailConfirmInfoTypeormEntity>,
    @InjectRepository(PasswordRecoveryInfoTypeormEntity)
    protected passwordRecoveryRepository: Repository<PasswordRecoveryInfoTypeormEntity>,
  ) {}
  @Delete('all-data')
  @HttpCode(204)
  async deleteAllData(): Promise<void> {
    await this.emailConfirmRepository.deleteAll();
    await this.passwordRecoveryRepository.deleteAll();
    await this.sessionRepository.deleteAll();
    await this.userRepository.deleteAll();
    return;
  }
}
