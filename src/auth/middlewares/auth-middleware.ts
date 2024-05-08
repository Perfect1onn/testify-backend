import { Request, Response, NextFunction} from "nestling.js";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
      try {
            const token = req.headers.authorization

            if(!token) {
                  throw "token is invalid"
            }
      
            const accessToken = token.split(" ")[1];
      
            if(!accessToken) {
                  throw "token is invalid"
            }
      
            jwt.verify(accessToken, process.env.ACCESS_SECRET!)

            next()
      } catch(error) {
            return res.status(401).send(error)
      }
}