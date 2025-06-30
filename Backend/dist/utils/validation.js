"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeUrlSchema = exports.chapterUpdateSchema = exports.chapterSchema = exports.subjectUpdateSchema = exports.subjectSchema = exports.standardUpdateSchema = exports.standardSchema = exports.adminRegisterSchema = exports.adminLoginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Admin validation schemas
exports.adminLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
exports.adminRegisterSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
// Standard validation schemas
exports.standardSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required(),
    description: joi_1.default.string().allow('').optional(),
    order: joi_1.default.number().integer().min(1).required(),
});
exports.standardUpdateSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).optional(),
    description: joi_1.default.string().allow('').optional(),
    order: joi_1.default.number().integer().min(1).optional(),
});
// Subject validation schemas
exports.subjectSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required(),
    description: joi_1.default.string().allow('').optional(),
    standardId: joi_1.default.string().required(),
});
exports.subjectUpdateSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).optional(),
    description: joi_1.default.string().allow('').optional(),
});
// Chapter validation schemas
exports.chapterSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(200).required(),
    description: joi_1.default.string().allow('').optional(),
    order: joi_1.default.number().integer().min(1).required(),
    subjectId: joi_1.default.string().required(),
    videoUrl: joi_1.default.string().uri().allow('').optional(),
    solutionPdfUrl: joi_1.default.string().allow('').optional(),
    textbookPdfUrl: joi_1.default.string().allow('').optional(),
});
exports.chapterUpdateSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(200).optional(),
    description: joi_1.default.string().allow('').optional(),
    order: joi_1.default.number().integer().min(1).optional(),
    videoUrl: joi_1.default.string().uri().allow('').optional(),
    solutionPdfUrl: joi_1.default.string().allow('').optional(),
    textbookPdfUrl: joi_1.default.string().allow('').optional(),
});
// YouTube URL validation
exports.youtubeUrlSchema = joi_1.default.string().pattern(/^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/);
