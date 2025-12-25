export type AccessTokenPayloadType = {
  sub: string;
  login: string;
};
export type RefreshTokenPayloadType = {
  sub: string;
  login: string;
  deviceId: string;
};
