import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import statsRoutes from './routes/stats.routes';
import prizeRoutes from './routes/prizes.routes';
import adminRoutes from './routes/admins.routes';
import promotionsRoutes from './routes/promotions.routes';
import foundersLinksRoutes from './routes/founders-links.routes';
import cardsRoutes from './routes/cards.routes';
import rouletteRoutes from './routes/roulette.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/prizes', prizeRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/founders-links', foundersLinksRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/roulette', rouletteRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`CRM Backend running on port ${PORT}`);
});
