import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';
import { UserInputType, UserViewType } from '../Types/Types';
import { add } from 'date-fns';
import { ObjectId } from 'mongodb';

@Schema()
export class User {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: MongooseSchema.Types.Date, required: true })
  createdAt: Date;

  static createNewUser(
    this: UserModelType,
    user: UserInputType,
    hashedPassword: string,
    confirmCode?: string,
  ) {
    return new this({
      id: new ObjectId().toString(),
      login: user.login,
      email: user.email,
      password: hashedPassword,
      createdAt: new Date(),
      emailConfirmationInfo: {
        confirmationCode: confirmCode ? confirmCode : null,
        expirationDate: confirmCode ? add(new Date(), { days: 1 }) : null,
        isConfirmed: false,
      },
      passwordRecoveryCode: {
        confirmationCode: null,
        expirationDate: null,
      },
    });
  }
}

export type UserDocumentType = HydratedDocument<User>;
export type UserModelType = Model<UserDocumentType> & typeof User;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
