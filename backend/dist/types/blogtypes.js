"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlogInput = exports.createBlogInput = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createBlogInput = zod_1.default.object({
    title: zod_1.default.string(),
    content: zod_1.default.any(),
    subtitle: zod_1.default.string().optional(),
    coverimage: zod_1.default.string().optional(),
    tags: zod_1.default.array(zod_1.default.string()).optional()
});
exports.updateBlogInput = zod_1.default.object({
    title: zod_1.default.string(),
    content: zod_1.default.any(),
    id: zod_1.default.number()
});
