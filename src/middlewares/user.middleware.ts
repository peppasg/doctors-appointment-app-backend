import { Request, Response, NextFunction } from "express";
import {IRole} from "../models/role.model"

export const hasAdminRole = (req: Request, res: Response, next: NextFunction) => {
    try{
        
        const checkAdminRole = req.user.roles.some((r: IRole) => r.role === "ADMIN" && r.active);
        if (!checkAdminRole) {
            return res.status(403).json({message: "Forbidden: No Admin Role"});
        }
        next();  
    } catch (err) {
        res.status(401).json({message: "Invalid or expired token"});
    }
}