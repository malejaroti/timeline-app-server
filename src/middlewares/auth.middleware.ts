import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth';

// Extend Request interface to include payload property
interface AuthenticatedRequest extends Request {
  payload?: JwtPayload;
}

export default function validateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {

  console.log(req.headers)

  try {
    const authHeader = req.headers.authorization;
    if(!authHeader) throw new Error("No auth header")
    const authToken = authHeader.split(" ")[1]
    const payload = jwt.verify(authToken, process.env.TOKEN_SECRET!) as JwtPayload;
    req.payload = payload // passing the payload to the route so it can be used for the functionality
    
    next() // continue with the route

  } catch (error) {
    res.status(401).json({errorMessage: "token no sent or is not valid"})
  }
}
// function validateAdminRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {

//   if (req.payload && req.payload.role === "admin") {
//     next() // continue to the route
//   } else {
//     res.status(401).json({errorMessage: "you are not an admin"})
//   }

// }

// module.exports = {
//   validateToken
// }