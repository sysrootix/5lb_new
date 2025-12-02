import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { 
    getFoundersLinks, 
    createFoundersLink, 
    createBulkFoundersLinks, 
    deleteFoundersLink,
    getAllForExport
} from '../controllers/founders-links.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', getFoundersLinks);
router.get('/export', getAllForExport);
router.post('/', createFoundersLink);
router.post('/bulk', createBulkFoundersLinks);
router.delete('/:id', deleteFoundersLink);

export default router;




