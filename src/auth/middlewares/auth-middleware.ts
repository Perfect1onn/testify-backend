import { NextFunction } from "express";
import { IRequest, IResponse } from "../../types";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: IRequest, res: IResponse, next: NextFunction) => {
      try {
            const token = req.headers.authorization

            if(!token) {
                  throw "token is invalid"
            }
      
            const accessToken = token.split(" ")[1];
      
            if(!accessToken) {
                  throw "token is invalid"
            }
      
            jwt.verify(accessToken, "access_secret")

            next()
      } catch(error) {
            return res.status(401).send(error)
      }
}