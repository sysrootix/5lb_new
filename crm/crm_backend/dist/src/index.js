"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const prizes_routes_1 = __importDefault(require("./routes/prizes.routes"));
const admins_routes_1 = __importDefault(require("./routes/admins.routes"));
const promotions_routes_1 = __importDefault(require("./routes/promotions.routes"));
const founders_links_routes_1 = __importDefault(require("./routes/founders-links.routes"));
const cards_routes_1 = __importDefault(require("./routes/cards.routes"));
const roulette_routes_1 = __importDefault(require("./routes/roulette.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/stats', stats_routes_1.default);
app.use('/api/prizes', prizes_routes_1.default);
app.use('/api/admins', admins_routes_1.default);
app.use('/api/promotions', promotions_routes_1.default);
app.use('/api/founders-links', founders_links_routes_1.default);
app.use('/api/cards', cards_routes_1.default);
app.use('/api/roulette', roulette_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(PORT, () => {
    console.log(`CRM Backend running on port ${PORT}`);
});
