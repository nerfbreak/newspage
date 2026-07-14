import { z } from 'zod';
import { TASK_NAMES } from '@/lib/constants/statuses';

// POST /api/jobs
export const createJobSchema = z.object({
  task_name: z.enum(TASK_NAMES),
  params: z.record(z.string(), z.unknown()).optional().default({}),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

// GET /api/jobs query params
export const listJobsSchema = z.object({
  status: z.enum(['queued', 'running', 'success', 'failed', 'cancelled']).optional(),
  task_name: z.string().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListJobsInput = z.infer<typeof listJobsSchema>;

// GET /api/logs query params
export const listLogsSchema = z.object({
  job_id: z.string().uuid().optional(),
  level: z.enum(['info', 'warning', 'error', 'success']).optional(),
  q: z.string().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export type ListLogsInput = z.infer<typeof listLogsSchema>;

// POST /api/worker/heartbeat
export const workerHeartbeatSchema = z.object({
  worker_id: z.string().min(1).max(100),
  status: z.string().min(1).max(50).optional().default('online'),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type WorkerHeartbeatInput = z.infer<typeof workerHeartbeatSchema>;

// POST /api/worker/webhook
export const workerWebhookSchema = z.object({
  job_id: z.string().uuid(),
  status: z.enum(['running', 'success', 'failed', 'cancelled']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  error_message: z.string().optional(),
  result: z.record(z.string(), z.unknown()).optional(),
  log: z
    .object({
      level: z.enum(['info', 'warning', 'error', 'success']).optional().default('info'),
      message: z.string().min(1),
      metadata: z.record(z.string(), z.unknown()).optional().default({}),
    })
    .optional(),
});

export type WorkerWebhookInput = z.infer<typeof workerWebhookSchema>;
