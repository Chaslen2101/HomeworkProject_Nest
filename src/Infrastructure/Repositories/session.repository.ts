// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import type { SessionModelType } from '../../Domain/session.entity';
// import { Session, SessionDocumentType } from '../../Domain/session.entity';
// import { DeleteResult } from 'mongodb';
// import { RefreshTokenPayloadType } from '../../Types/Types';
// import { mapToView } from '../../Core/helper';
//
// @Injectable()
// export class SessionRepository {
//   constructor(
//     @InjectModel(Session.name) private readonly sessionModel: SessionModelType,
//   ) {}
//
//   async save(session: SessionDocumentType): Promise<SessionDocumentType> {
//     return session.save();
//   }
//
//   async findByDeviceId(deviceId: string): Promise<SessionDocumentType | null> {
//     return await this.sessionModel.findOne({ deviceId: deviceId });
//   }
//
//   async deleteSession(deviceId: string): Promise<DeleteResult> {
//     return await this.sessionModel.deleteOne({ deviceId: deviceId });
//   }
//
//   async deleteAllSessions(sessionsInfo: RefreshTokenPayloadType) {
//     return await this.sessionModel.deleteMany({
//       userId: sessionsInfo.sub,
//       deviceId: { $ne: sessionsInfo.deviceId },
//     });
//   }
//
//   async findAllMySessions(sessionsInfo: RefreshTokenPayloadType) {
//     const sessions: SessionDocumentType[] = await this.sessionModel.find({
//       userId: sessionsInfo.sub,
//     });
//     return mapToView.mapSessionsInfo(sessions);
//   }
// }
