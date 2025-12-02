import { Router } from 'express';
import {
    getCardTypes,
    getUserCards,
    assignCard,
    updateCardBalance,
    revokeCard,
    activateCard,
    getCardTransactions,
} from '../controllers/cards.controller';

const router = Router();

// Получить все типы карт
router.get('/types', getCardTypes);

// Получить карты пользователя
router.get('/user/:userId', getUserCards);

// Выдать карту пользователю
router.post('/user/:userId/assign', assignCard);

// Пополнить/изменить баланс карты
router.patch('/:userCardId/balance', updateCardBalance);

// Отозвать карту (деактивировать)
router.post('/:userCardId/revoke', revokeCard);

// Активировать карту
router.post('/:userCardId/activate', activateCard);

// Получить транзакции по карте
router.get('/:userCardId/transactions', getCardTransactions);

export default router;
