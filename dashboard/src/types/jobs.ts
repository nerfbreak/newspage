import type { AutomationJob, AutomationLog, Profile } from './database';

export type { JobStatus, LogLevel, UserRole } from './database';

export interface JobWithProfile extends AutomationJob {
  profile: Pick<Profile, 'id' | 'full_name'> | null;
}

export interface JobFilters {
  status?: string;
  task_name?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface LogFilters {
  job_id?: string;
  level?: string;
  q?: string;
  from?: string;
  to?: string;
}

export interface DashboardStats {
  jobsToday: number;
  running: number;
  success: number;
  failed: number;
  latestJob: AutomationJob | null;
}

export interface PaginatedJobs {
  jobs: JobWithProfile[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type { AutomationJob, AutomationLog, Profile };
