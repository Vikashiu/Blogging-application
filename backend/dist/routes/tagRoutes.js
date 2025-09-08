"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// GET all tags
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tags = yield prisma.tag.findMany();
        res.json(tags);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
}));
// GET tag by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tag = yield prisma.tag.findUnique({
            where: { id: req.params.id },
        });
        if (!tag)
            return res.status(404).json({ error: 'Tag not found' });
        res.json(tag);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tag' });
    }
}));
// CREATE new tag
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const newTag = yield prisma.tag.create({
            data: { name },
        });
        res.status(201).json(newTag);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create tag' });
    }
}));
// UPDATE tag by ID
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const updatedTag = yield prisma.tag.update({
            where: { id: req.params.id },
            data: { name },
        });
        res.json(updatedTag);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update tag' });
    }
}));
// DELETE tag by ID
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.tag.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Tag deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete tag' });
    }
}));
exports.default = router;
