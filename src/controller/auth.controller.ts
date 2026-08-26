import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        const result = await authService.signup(payload);

        if (!result) {
            return res.status(400).json({ message: 'User already exists or invalid payload' });
        }

        return res.status(201).json({
            access_token: result.token,
            token_type: 'bearer',
            role: result.role,
        });
    } catch (err) {
        return next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);

        if (!result) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        return res.status(200).json({
            access_token: result.token,
            token_type: 'bearer',
            role: result.role,
        });
    } catch (err) {
        return next(err);
    }
};