import { Router } from 'express';
import { getNews, createNews, deleteNews } from '../controllers/news.controller';

const router = Router();

router.get('/', getNews);
router.post('/', createNews);
router.delete('/:id', deleteNews);

export default router;
