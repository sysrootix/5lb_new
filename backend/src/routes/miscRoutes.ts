import { Router } from 'express';
import * as miscController from '../controllers/miscController';

const router = Router();

router.get('/check-country', miscController.checkCountry);

export default router;
