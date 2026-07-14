// Types generated from Supabase schema
// Keep in sync with supabase/migrations/

export type UserRole = 'admin' | 'operator' | 'viewer';
export type JobStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
export type LogLevel = 'info' | 'warning' | 'error' | 'success';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AutomationJob {
  id: string;
  task_name: string;
  status: JobStatus;
  progress: number;
  params: Record<string, unknown>;
  result: JobResult | null;
  error_message: string | null;
  triggered_by: string | null;
  locked_by: string | null;
  cancel_requested: boolean;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  job_id: string;
  level: LogLevel;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AutomationSetting {
  id: string;
  key: string;
  value: unknown;
  is_secret: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkerHeartbeat {
  id: string;
  worker_id: string;
  status: string;
  metadata: WorkerMetadata;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface WorkerMetadata {
  version?: string;
  runtime?: string;
  current_job_id?: string;
  [key: string]: unknown;
}

export interface JobResult {
  total_records?: number;
  processed_records?: number;
  success_count?: number;
  failed_count?: number;
  duration_seconds?: number;
  artifacts?: string[];
  summary?: string;
  [key: string]: unknown;
}
