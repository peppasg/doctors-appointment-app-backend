import {Request, Response, NextFunction} from 'express';
import { Types } from 'mongoose';
import * as userService from '../services/user.service';
import { UpdateUserDTO } from '../dto/user.dto';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.findUsers();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const getOneByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = Array.isArray(req.params.email) ? req.params.email[0] : req.params.email;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const result = await userService.findUserByEmail(email);
        if (!result)
            return res.status(404).json({ message: 'User not found by email' });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

export const create = async(req:Request, res: Response, next: NextFunction) => {
try {
    if (req.body.roles?.some((roleId: string) => !Types.ObjectId.isValid(roleId))) {
        return res.status(400).json({ message: 'Invalid role id' });
    }
    const user = await userService.createUser(req.body);
    res.status(201).json({status:true, data:user});
} catch (err) {next(err)}
}


export const update = async(req:Request, res: Response, next: NextFunction) => {
    try {
        const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const data: UpdateUserDTO = req.body;
        if (data.roles?.some((roleIds) => !Types.ObjectId.isValid(roleIds))) {
            return res.status(400).json({ message: 'Invalid role id' });
        }
        const result = await userService.updateUser(username, data);
        if (!result)
            return res.status(401).json({ message: "User not found" })
        res.status(200).json(result);

    } catch (err) {
        next(err)
    }
}