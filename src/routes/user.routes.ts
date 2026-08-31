import {Router} from 'express';
import * as userCtrl from "../controller/user.controller";
import {authenticate} from '../middlewares/auth.middleware';
import { hasPatientRole } from '../middlewares/user.middleware';
import {validate} from '../middlewares/validate.middleware';
import {createUserSchema} from '../validators/user.validator';

const router = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     parameters: []
 *     responses:
 *       200:
 *         description: Array of users
 */
router.get('/', userCtrl.getAll)

/**
 * @openapi
 * /users/email/{email}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: Email is required
 *       404:
 *         description: User not found
 */
router.get('/email/:email', userCtrl.getOneByEmail);

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     description: Requires a valid JWT with an active PATIENT role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing, invalid, or expired token
 *       403:
 *         description: Caller is not an admin
 */
router.post('/', authenticate, hasPatientRole, validate(createUserSchema), userCtrl.create);

/**
 * @openapi
 * /users/{username}:
 *   put:
 *     tags: [Users]
 *     summary: Update a user by username
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: jdoe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           example:
 *             password: "your_password"
 *             firstname: "firstname"
 *             lastname: "lastname"
 *             email: "test@example.com"
 *             roles: ["6a833100669a99aaeec5dbcc"]
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Username is required
 *       401:
 *         description: User not found
 */
router.put('/:username', userCtrl.update);


export default router;
