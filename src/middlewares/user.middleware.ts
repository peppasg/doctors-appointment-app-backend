import { Request, Response, NextFunction } from "express";
import {IRole} from "../models/role.model"

export const hasPatientRole = (req: Request, res: Response, next: NextFunction) => {
    try{
        
        const checkPatientRole = req.user.roles.some((r: IRole) => r.role === "PATIENT" && r.active);
        if (!checkPatientRole) {
            return res.status(403).json({message: "Forbidden: No Patient Role"});
        }
        next();  
    } catch (err) {
        res.status(401).json({message: "Invalid or expired token"});
    }
}