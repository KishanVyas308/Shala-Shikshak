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
  standardId: Joi.string().required(),
});

export const subjectUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().allow('').optional(),
});

// Chapter validation schemas (simplified)
export const chapterSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').optional(),
  subjectId: Joi.string().required(),
});

export const chapterUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  description: Joi.string().allow('').optional(),
});

// Chapter Resource validation schemas
export const chapterResourceSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').optional(),
  type: Joi.string().valid('svadhyay', 'svadhyay_pothi', 'other').required(),
  resourceType: Joi.string().valid('video', 'pdf').required(),
  url: Joi.string().uri().optional(), // Made optional for file uploads
  fileName: Joi.string().allow('').optional(),
  chapterId: Joi.string().required(),
});

export const chapterResourceUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().allow('').optional(),
  type: Joi.string().valid('svadhyay', 'svadhyay_pothi', 'other').optional(),
  resourceType: Joi.string().valid('video', 'pdf').optional(),
  url: Joi.string().uri().optional(),
  fileName: Joi.string().allow('').optional(),
});

// YouTube URL validation
export const youtubeUrlSchema = Joi.string().pattern(
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/
);

// PageView validation schemas
export const pageViewSchema = Joi.object({
  page: Joi.string().min(1).max(500).required(),
  userId: Joi.string().optional().allow(null),
  userAgent: Joi.string().max(1000).optional().allow(null),
  platform: Joi.string().valid('web', 'app').default('web'),
});
