import { Injectable } from '@nestjs/common';
import { EmailService } from '../Infrastructure/Email/email.service';

@Injectable()
export class NotificationService {
  constructor(private readonly emailService: EmailService) {}

  async passwordRecovery(email: string, code: string): Promise<void> {
    await this.emailService.PasswordRecoveryLetter(email, code);
    return;
  }

  async registration(email: string, code: string): Promise<void> {
    await this.emailService.EmailConfirmLetter(email, code);
  }
}
