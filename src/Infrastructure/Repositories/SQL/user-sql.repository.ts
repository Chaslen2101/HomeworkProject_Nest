import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  EmailConfirmationInfo,
  PasswordRecoveryInfo,
  User,
} from '../../../Domain/user.entity';

@Injectable()
export class UserSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  // async save(newUser: UserDocumentType): Promise<UserDocumentType> {
  //   const keysToUpdate: string[] = Object.keys(newUser);
  //   const keysString: string[] = keysToUpdate.map(
  //     (key: string, index: number): string => {
  //       return `"${key}" = $${index + 1}, `;
  //     },
  //   );
  //
  //   const valuesToUpdate: any[] = Object.values(newUser);
  //
  //   const result = this.dataSource.query(
  //     `
  //       UPDATE "User"
  //       SET ${keysString}
  //       WHERE "id" = $${valuesToUpdate.length}
  //       RETURNING *;
  //       `,
  //     [...valuesToUpdate, newUser.id],
  //   );
  //
  //   return;
  // }

  async deleteUser(userId: string): Promise<boolean> {
    await this.dataSource.query(
      `DELETE FROM email_confirmation_info WHERE user_id = $1`,
      [userId],
    );
    await this.dataSource.query(
      `DELETE FROM password_recovery_info WHERE user_id = $1`,
      [userId],
    );
    await this.dataSource.query(`DELETE FROM "session" WHERE user_id = $1`, [
      userId,
    ]);
    const result = await this.dataSource.query(
      `DELETE FROM "user" WHERE id = $1`,
      [userId],
    );

    return result[1];
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const result = await this.dataSource.query(
      `
                SELECT
                    u.*,
                    e.confirmation_code as email_confirmation_code,
                    e.expiration_date as email_code_expiration_date,
                    e.is_confirmed as email_is_confirmed,
                    p.expiration_date as password_code_expiration_date,
                    p.confirmation_code as password_confirmation_code
                FROM "user" u
                LEFT JOIN email_confirmation_info e ON u.id = e.user_id
                LEFT JOIN password_recovery_info p ON u.id = p.user_id            
                WHERE u.login = $1 OR u.email = $1
            `,
      [loginOrEmail],
    );
    if (result.length === 0) {
      return null;
    }

    return new User(
      result[0].id,
      result[0].login,
      result[0].email,
      result[0].password,
      result[0].createdAt,
    );
  }

  async findUserById(userId: string): Promise<User | null> {
    const result = await this.dataSource.query(
      `
          SELECT *
          FROM "user" u
          WHERE u.id = $1
          `,
      [userId],
    );

    if (result.length === 0) {
      return null;
    }

    return new User(
      result[0].id,
      result[0].login,
      result[0].email,
      result[0].password,
      result[0].createdAt,
    );
  }

  async createNewUser(
    newUser: User,
    emailConfirmInfo?: EmailConfirmationInfo,
  ): Promise<string> {
    const createdUserId = await this.dataSource.query(
      `
                INSERT INTO "user"
                            (id,login,email,password,created_at)
                VALUES ($1,$2,$3,$4,$5)
                RETURNING id
      `,
      [
        newUser.id,
        newUser.login,
        newUser.email,
        newUser.password,
        newUser.createdAt,
      ],
    );

    if (emailConfirmInfo) {
      await this.dataSource.query(
        `
                INSERT INTO email_confirmation_info
                              (user_id, confirmation_code, expiration_date, is_confirmed)
                VALUES ($1,$2,$3,$4)
      `,
        [
          emailConfirmInfo.userId,
          emailConfirmInfo.confirmationCode,
          emailConfirmInfo.expirationDate,
          emailConfirmInfo.isConfirmed,
        ],
      );
    }
    return createdUserId[0];
  }

  async findEmailConfirmInfoByCode(
    code: string,
  ): Promise<EmailConfirmationInfo | null> {
    const emailConfirmInfo = await this.dataSource.query(
      `
        SELECT *
        FROM email_confirmation_info e
        WHERE e.confirmation_code = $1
        `,
      [code],
    );
    if (emailConfirmInfo.length === 0) {
      return null;
    }
    return new EmailConfirmationInfo(
      emailConfirmInfo[0].user_id,
      emailConfirmInfo[0].confirmation_code,
      emailConfirmInfo[0].expiration_date,
      emailConfirmInfo[0].is_confirmed,
    );
  }

  async findEmailConfirmInfoByUserId(
    userId: string,
  ): Promise<EmailConfirmationInfo | null> {
    const emailConfirmInfo = await this.dataSource.query(
      `
        SELECT *
        FROM email_confirmation_info e
        WHERE e.user_id = $1
        `,
      [userId],
    );
    if (emailConfirmInfo.length === 0) {
      return null;
    }
    return new EmailConfirmationInfo(
      emailConfirmInfo[0].user_id,
      emailConfirmInfo[0].confirmation_code,
      emailConfirmInfo[0].expiration_date,
      emailConfirmInfo[0].is_confirmed,
    );
  }

  async updateEmailConfirmInfo(
    emailConfirmInfo: EmailConfirmationInfo,
  ): Promise<boolean> {
    await this.dataSource.query(
      `
      UPDATE email_confirmation_info 
      SET confirmation_code = $1, expiration_date = $2, is_confirmed=$3
      WHERE user_id = $4
          `,
      [
        emailConfirmInfo.confirmationCode,
        emailConfirmInfo.expirationDate,
        emailConfirmInfo.isConfirmed,
        emailConfirmInfo.userId,
      ],
    );
    return true;
  }

  async createPasswordRecoveryInfo(
    passwordRecoveryInfo: PasswordRecoveryInfo,
  ): Promise<void> {
    await this.dataSource.query(
      `
          INSERT INTO password_recovery_info
                            (expiration_date, user_id, confirmation_code)
          VALUES ($1,$2,$3)
          `,
      [
        passwordRecoveryInfo.expirationDate,
        passwordRecoveryInfo.userId,
        passwordRecoveryInfo.confirmationCode,
      ],
    );
    return;
  }

  async findPasswordRecoveryInfoByCode(
    code: string,
  ): Promise<PasswordRecoveryInfo | null> {
    const result = await this.dataSource.query(
      `
          SELECT *
          FROM password_recovery_info
          WHERE confirmation_code = $1
          `,
      [code],
    );
    if (result.length === 0) {
      return null;
    }

    return new PasswordRecoveryInfo(
      result[0].user_id,
      result[0].confirmation_code,
      result[0].expiration_date,
    );
  }
}

//
//   async changeEmailConfirmCode(code: string, userId: string): Promise<boolean> {
//     const result = await this.UserModel.updateOne(
//       { id: userId },
//       { $set: { 'emailConfirmationInfo.confirmationCode': code } },
//     );
//     return result.modifiedCount === 1;
//   }
//
//   async changePasswordConfirmCode(
//     code: string,
//     userId: string,
//   ): Promise<boolean> {
//     const expirationDate: string = add(new Date(), { hours: 1 }).toISOString();
//     const result = await this.UserModel.updateOne(
//       { id: userId },
//       {
//         $set: {
//           'passwordRecoveryCode.confirmationCode': code,
//           'passwordRecoveryCode.expirationDate': expirationDate,
//         },
//       },
//     );
//     return result.modifiedCount === 1;
//   }
//
//   async changePassword(newPassword: string, userId: string): Promise<boolean> {
//     const result = await this.UserModel.updateOne(
//       { id: userId },
//       { $set: { password: newPassword } },
//     );
//
//     return result.modifiedCount === 1;
//   }
// }

// async findByPasswordConfirmCode(
//   id: string,
// ): Promise<UserDocumentType | null> {
//   return await this.UserModel.findOne(
//     { 'emailConfirmationInfo.confirmationCode': id },
//     { prejection: { _id: 0 } },
//   );
// }

// async findByUserId(id: string): Promise<UserDocumentType | null> {
//   return await this.UserModel.findOne({ id: id });
// }
//
// async findByEmailConfirmCode(id: string): Promise<UserDocumentType | null> {
//   return await this.UserModel.findOne(
//     { 'emailConfirmationInfo.confirmationCode': id },
//     { prejection: { _id: 0 } },
//   );
// }
