import { Router } from 'express';
import { 
    getAdmins, 
    createAdmin, 
    updateAdmin, 
    deleteAdmin 
} from '../controllers/admins.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('root')); // Only root can manage admins

router.get('/', getAdmins);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);

export default router;



