"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cards_controller_1 = require("../controllers/cards.controller");
const router = (0, express_1.Router)();
// Получить все типы карт
router.get('/types', cards_controller_1.getCardTypes);
// Получить карты пользователя
router.get('/user/:userId', cards_controller_1.getUserCards);
// Выдать карту пользователю
router.post('/user/:userId/assign', cards_controller_1.assignCard);
// Пополнить/изменить баланс карты
router.patch('/:userCardId/balance', cards_controller_1.updateCardBalance);
// Отозвать карту (деактивировать)
router.post('/:userCardId/revoke', cards_controller_1.revokeCard);
// Активировать карту
router.post('/:userCardId/activate', cards_controller_1.activateCard);
// Получить транзакции по карте
router.get('/:userCardId/transactions', cards_controller_1.getCardTransactions);
exports.default = router;
