"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommentInput = exports.createCommentInput = void 0;
const zod_1 = __importDefault(require("zod"));
// Create Comment Schema
exports.createCommentInput = zod_1.default.object({
    content: zod_1.default.string().min(1, "Comment cannot be empty"),
    blogId: zod_1.default.string().uuid("Invalid blog ID format"),
});
// Optionally, Update Comment Schema (if you allow editing)
exports.updateCommentInput = zod_1.default.object({
    id: zod_1.default.string().uuid("Invalid comment ID"),
    content: zod_1.default.string().min(1, "Comment cannot be empty"),
});
