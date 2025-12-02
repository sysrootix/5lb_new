import { Router } from 'express';
import { getStories, getStoryById, createStory, deleteStory } from '../controllers/story.controller';

const router = Router();

router.get('/', getStories);
router.get('/:id', getStoryById);
router.post('/', createStory);
router.delete('/:id', deleteStory);

export default router;
