import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  @Delete('all-data')
  @HttpCode(204)
  async deleteAllData(): Promise<void> {
    await this.dataSource.query(
      `
        TRUNCATE TABLE "email_confirmation_info" CASCADE;
        TRUNCATE TABLE "password_recovery_info" CASCADE;
        TRUNCATE TABLE "session" CASCADE;
        TRUNCATE TABLE "user" CASCADE;
        `,
    );
    return;
  }
}
