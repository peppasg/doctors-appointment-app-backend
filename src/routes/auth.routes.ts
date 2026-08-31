import { Router } from 'express';
import * as authCtrl from '../controller/auth.controller';

const router = Router();

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     description: Creates a user with the PATIENT role and returns a JWT.
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: User already exists or invalid payload
 */
router.post('/signup', authCtrl.signup);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     description: Authenticates with username and password and returns a JWT.
 *     responses:
 *       200:
 *         description: Authenticated
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authCtrl.login);

export default router;
