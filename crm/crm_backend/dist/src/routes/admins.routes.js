"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admins_controller_1 = require("../controllers/admins.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.use((0, auth_middleware_1.requireRole)('root')); // Only root can manage admins
router.get('/', admins_controller_1.getAdmins);
router.post('/', admins_controller_1.createAdmin);
router.put('/:id', admins_controller_1.updateAdmin);
router.delete('/:id', admins_controller_1.deleteAdmin);
exports.default = router;
