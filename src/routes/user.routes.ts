import {Router} from 'express';
import * as userCtrl from "../controller/user.controller";
import {authenticate} from '../middlewares/auth.middleware';
import { hasAdminRole } from '../middlewares/user.middleware';
import {validate} from '../middlewares/validate.middleware';
import {createUserSchema, updateUserSchema} from '../validators/user.validator';

const router = Router();

router.get('/', userCtrl.getAll)
router.get('/email/:email', userCtrl.getOneByEmail);
router.post('/', authenticate, hasAdminRole, validate(createUserSchema), userCtrl.create);
router.put('/:username', userCtrl.update);


export default router;