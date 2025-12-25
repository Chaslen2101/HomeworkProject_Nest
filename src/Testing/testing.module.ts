import { Module } from '@nestjs/common';
import { TestingController } from './Api/testing.controller';

@Module({
  imports: [],
  controllers: [TestingController],
})
export class TestingModule {}
