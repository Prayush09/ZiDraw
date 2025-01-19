import jwt, { JwtPayload } from 'jsonwebtoken'
import {Request} from 'express'
import {JWT_SECRET} from '@repo/backend-common/config';

interface CustomRequest extends Request{
    userId?: string;
}
import {Response, NextFunction} from 'express';


interface customType extends JwtPayload{
    userId: string;
}

export function middleware(req: CustomRequest, res: Response, next: NextFunction){
    const token = req.headers.authorization?.split(" ")[1] || "";
    try{
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        
        if((decoded as customType).userId){
            req.userId = (decoded as JwtPayload).userId;
            next();
        }
        else{
            res.status(403).json({message: "User is not authenticated1", token: token});
        }
    } 
    catch(e){
        res.status(403).json({message: "User is not authenticated2", error: e, token: token});
        return;
    }
}