import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as process from 'node:process';

@Injectable()
export class EmailService {
  constructor(
    @Inject(MailerService) private readonly mailerService: MailerService,
  ) {}
  async sendEmailConfirmCode(
    emailAddress: string,
    confirmCode: string,
  ): Promise<boolean> {
    try {
      const confirmLink: string = `https://homework-project-guild.vercel.app/auth/registration-confirmation?code=${confirmCode}`;
      const subject: string = 'Verify your email address';

      await this.mailerService.sendMail({
        from: '"Chaslen2101" <Chaslen2101.itincubator@gmail.com>',
        to: emailAddress,
        subject: subject,
        html: `<h1>Password recovery</h1>
            <p>To confirm email please follow the link below:
            <a href=${confirmLink}>recovery password</a></p>`,
        headers: { Authorization: `Bearer ${process.env.SENDGREED_PASSWORD}` },
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async sendPasswordRecoveryEmail(
    emailAddress: string,
    confirmCode: string,
  ): Promise<boolean> {
    try {
      const confirmLink: string = `https://homework-project-guild.vercel.app/auth/password-recovery?code=${confirmCode}`;
      const subject: string = 'Confirm password recovery';

      await this.mailerService.sendMail({
        from: '"Chaslen2101" <Chaslen2101.itincubator@gmail.com>',
        to: emailAddress,
        subject: subject,
        html: `<h1>Password recovery</h1>
            <p>To finish password recovery please follow the link below:
            <a href=${confirmLink}>recovery password</a></p>`,
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
