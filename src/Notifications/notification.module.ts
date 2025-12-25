import { Module } from '@nestjs/common';
import { EmailModule } from './Infrastructure/Email/email.module';
import { NotificationService } from './Application/notification.service';

@Module({
  imports: [EmailModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
