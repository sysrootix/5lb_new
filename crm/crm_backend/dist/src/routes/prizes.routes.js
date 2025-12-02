"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prizes_controller_1 = require("../controllers/prizes.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Stats routes
router.get('/stats', auth_middleware_1.authenticateToken, prizes_controller_1.getPrizeStats);
router.get('/activity', auth_middleware_1.authenticateToken, prizes_controller_1.getPrizeActivity);
// CRUD routes
router.get('/', auth_middleware_1.authenticateToken, prizes_controller_1.getPrizes);
router.get('/:id', auth_middleware_1.authenticateToken, prizes_controller_1.getPrize);
router.post('/', auth_middleware_1.authenticateToken, prizes_controller_1.createPrize);
router.put('/:id', auth_middleware_1.authenticateToken, prizes_controller_1.updatePrize);
router.delete('/:id', auth_middleware_1.authenticateToken, prizes_controller_1.deletePrize);
exports.default = router;
