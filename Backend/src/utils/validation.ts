import Joi from 'joi';

// Admin validation schemas
export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const adminRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Standard validation schemas
export const standardSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().allow('').optional(),
  order: Joi.number().integer().min(1).required(),
});

export const standardUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().allow('').optional(),
  order: Joi.number().integer().min(1).optional(),
});

// Subject validation schemas
export const subjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().allow('').optional(),
  order: Joi.number().integer().min(1).required(),
  standardId: Joi.string().required(),
});

export const subjectUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().allow('').optional(),
  order: Joi.number().integer().min(1).optional(),
});

// Chapter validation schemas
export const chapterSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').optional(),
  order: Joi.number().integer().min(1).required(),
  subjectId: Joi.string().required(),
  videoUrl: Joi.string().uri().allow('').optional(),
  solutionPdfUrl: Joi.string().allow('').optional(),
  textbookPdfUrl: Joi.string().allow('').optional(),
});

export const chapterUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  description: Joi.string().allow('').optional(),
  order: Joi.number().integer().min(1).optional(),
  videoUrl: Joi.string().uri().allow('').optional(),
  solutionPdfUrl: Joi.string().allow('').optional(),
  textbookPdfUrl: Joi.string().allow('').optional(),
});

// YouTube URL validation
export const youtubeUrlSchema = Joi.string().pattern(
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/
);
