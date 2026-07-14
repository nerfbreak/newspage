/**
 * Format a duration in seconds to a human-readable string.
 * e.g. 540 -> "9m 0s", 65 -> "1m 5s", 45 -> "45s"
 */
export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  if (safeSeconds < 60) return `${safeSeconds}s`;
  const m = Math.floor(safeSeconds / 60);
  const s = safeSeconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}

/**
 * Calculate duration in seconds between two ISO date strings.
 * Returns null if either value is missing.
 */
export function calcDurationSeconds(
  startedAt: string | null,
  finishedAt: string | null
): number | null {
  if (!startedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  return Math.floor((end - start) / 1000);
}

/**
 * Format duration from started_at / finished_at directly.
 */
export function formatJobDuration(
  startedAt: string | null,
  finishedAt: string | null
): string {
  const secs = calcDurationSeconds(startedAt, finishedAt);
  if (secs === null) return '-';
  return formatDuration(secs);
}
