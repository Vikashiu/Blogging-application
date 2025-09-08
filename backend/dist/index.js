"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/index.js
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const giminiRoute_1 = __importDefault(require("./routes/giminiRoute")); // Assuming you have a geminiRouter for handling Gemini API requests
const tagRoutes_1 = __importDefault(require("./routes/tagRoutes"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, helmet_1.default)()); // Security headers
app.use((0, morgan_1.default)('dev')); // Logging
app.use('/api/v1/blogs', blogRoutes_1.default);
app.use('/api/v1/comments', commentRoutes_1.default);
app.use('/api/v1/users', userRoutes_1.default);
app.use('/api/v1/tags', tagRoutes_1.default);
app.use('/api/v1/gemini', giminiRoute_1.default); // Assuming you have a geminiRouter for handling Gemini API requests
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Something went wrong' });
});
const PORT = process.env.PORT || 3000; // Default to 3000 if PORT is not set
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
