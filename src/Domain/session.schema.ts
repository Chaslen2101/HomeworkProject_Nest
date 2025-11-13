import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';
import { Post, PostDocumentType } from './post.schema';

@Schema()
export class Session {
  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: MongooseSchema.Types.Date, required: true })
  lastActiveDate: Date;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  refreshToken: string;

  updateRefreshToken(this: SessionDocumentType, refreshToken: string): boolean {
    this.refreshToken = refreshToken;
    this.lastActiveDate = new Date();
    return true;
  }
}

export type SessionDocumentType = HydratedDocument<Session>;
export type SessionModelType = Model<SessionDocumentType> & typeof Session;
export const SessionSchema: MongooseSchema<Session> =
  SchemaFactory.createForClass(Session);
SessionSchema.loadClass(Session);
