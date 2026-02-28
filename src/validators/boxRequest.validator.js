import { z } from 'zod';

export const createBoxRequestSchema = z.object({
  shop: z.string().min(1),
});

export const assignBoxSchema = z.object({
  assignedBox: z.string().min(1),
});