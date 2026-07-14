import type { JobStatus, LogLevel } from '@/types/database';

// Task types matching the legacy Streamlit automation pages
export const TASK_NAMES = [
  'inventory_adjustment',
  'sales_extraction',
  'promotion_comparison',
  'stock_mutation',
  'clearance_stock',
  'initial_stock',
] as const;

export type TaskName = (typeof TASK_NAMES)[number];

export const TASK_LABELS: Record<TaskName, string> = {
  inventory_adjustment: 'Inventory Adjustment',
  sales_extraction: 'Sales Extraction',
  promotion_comparison: 'Promotion Comparison',
  stock_mutation: 'Stock Mutation',
  clearance_stock: 'Clearance Stock',
  initial_stock: 'Initial Stock',
};

// Status badge variants (matches shadcn/ui Badge variants + custom)
export const STATUS_BADGE_VARIANT: Record<JobStatus, string> = {
  queued: 'secondary',
  running: 'default',
  success: 'success',
  failed: 'destructive',
  cancelled: 'outline',
};

export const STATUS_LABELS: Record<JobStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  success: 'Success',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

// Log level colors for terminal display
export const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  info: 'text-blue-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  success: 'text-green-400',
};

export const LOG_LEVEL_LABELS: Record<LogLevel, string> = {
  info: 'INFO',
  warning: 'WARN',
  error: 'ERROR',
  success: 'OK',
};

// Worker offline threshold in minutes
export const WORKER_OFFLINE_THRESHOLD_MINUTES = 5;

// Pagination defaults
export const DEFAULT_PAGE_LIMIT = 20;
