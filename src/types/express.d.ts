import type { JwtPayload } from './auth';

declare module 'express-serve-static-core' {
  interface Request {
    payload?: JwtPayload; // optional until middleware sets it
  }
}
