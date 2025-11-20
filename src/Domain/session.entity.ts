import { SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';

export class Session {
  constructor(
    public userId: string,

    public ip: string,

    public title: string,

    public lastActiveDate: Date,

    public deviceId: string,

    public refreshToken: string,
  ) {}

  static createNew(
    userId: string,
    ip: string,
    deviceName: string,
    deviceId: string,
    hashedRefreshToken: string,
  ): Session {
    return new this(
      userId,
      ip,
      deviceName,
      new Date(),
      deviceId,
      hashedRefreshToken,
    );
  }

  updateRefreshToken(refreshToken: string): boolean {
    this.refreshToken = refreshToken;
    this.lastActiveDate = new Date();
    return true;
  }
}

export type SessionDocumentType = HydratedDocument<Session>;
export type SessionModelType = Model<SessionDocumentType> & typeof Session;
export const SessionEntity: MongooseSchema<Session> =
  SchemaFactory.createForClass(Session);
SessionEntity.loadClass(Session);
