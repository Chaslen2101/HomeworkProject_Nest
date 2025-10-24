import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocumentType } from '../../Domain/user.schema';
import type { UserModelType } from '../../Domain/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async save(newUser: UserDocumentType): Promise<UserDocumentType> {
    return await newUser.save();
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.UserModel.deleteOne({ _id: id });
    return result.deletedCount !== 0;
  }
}

//   async confirmEmail(userId: string): Promise<boolean> {
//     const result = await this.UserModel.updateOne(
//       { id: userId },
//       { $set: { 'emailConfirmationInfo.isConfirmed': true } },
//     );
//     return result.modifiedCount === 1;
//   }
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
