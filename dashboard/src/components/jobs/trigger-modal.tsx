'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, X, Play, ChevronDown } from 'lucide-react';
import { TASK_NAMES, TASK_LABELS } from '@/lib/constants/statuses';

interface TriggerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (jobId: string) => void;
}

export function TriggerModal({ open, onOpenChange, onSuccess }: TriggerModalProps) {
  const router = useRouter();
  const [taskName, setTaskName] = useState<string>(TASK_NAMES[0]);
  const [paramsStr, setParamsStr] = useState('{}');
  const [paramsError, setParamsError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  if (!open) return null;

  function handleClose() {
    setStep('form');
    setParamsStr('{}');
    setParamsError('');
    onOpenChange(false);
  }

  function handleParamsChange(value: string) {
    setParamsStr(value);
    try {
      JSON.parse(value);
      setParamsError('');
    } catch {
      setParamsError('Invalid JSON');
    }
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    try {
      JSON.parse(paramsStr);
    } catch {
      setParamsError('Invalid JSON');
      return;
    }
    setStep('confirm');
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_name: taskName, params: JSON.parse(paramsStr) }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message ?? 'Failed to create job');
        setLoading(false);
        return;
      }

      handleClose();
      onSuccess?.(data.job.id);
    } catch {
      toast.error('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-border bg-card shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {step === 'form' ? 'Run Automation' : 'Confirm Job'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleNext} className="p-6 space-y-5">
            {/* Task select */}
            <div className="space-y-2">
              <label htmlFor="task-select" className="text-sm font-medium">
                Task Type
              </label>
              <div className="relative">
                <select
                  id="task-select"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                >
                  {TASK_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {TASK_LABELS[name]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Params */}
            <div className="space-y-2">
              <label htmlFor="params-input" className="text-sm font-medium">
                Parameters{' '}
                <span className="text-muted-foreground font-normal">(optional JSON)</span>
              </label>
              <textarea
                id="params-input"
                value={paramsStr}
                onChange={(e) => handleParamsChange(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                placeholder="{}"
              />
              {paramsError && (
                <p className="text-xs text-red-400">{paramsError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!!paramsError}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              Review
            </button>
          </form>
        ) : (
          <div className="p-6 space-y-5">
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Task</span>
                <span className="font-medium">{TASK_LABELS[taskName as keyof typeof TASK_LABELS]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Parameters</span>
                <span className="font-mono text-xs text-muted-foreground max-w-[60%] truncate">
                  {paramsStr === '{}' ? 'None' : paramsStr}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              This will create a new <strong className="text-foreground">queued</strong> job. The worker will pick it up automatically.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-all"
              >
                Back
              </button>
              <button
                id="trigger-confirm-btn"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {loading ? 'Creating…' : 'Run Job'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
