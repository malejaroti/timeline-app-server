export interface JwtPayload {
  _id: string;
  role?: 'admin' | 'user';
  iat?: number;
  exp?: number;
}
