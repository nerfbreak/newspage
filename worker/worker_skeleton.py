#!/usr/bin/env python3
"""
Playwright Worker Skeleton
==========================
This is a reference implementation of the automation worker.

Wrap your existing Playwright business logic inside the `run_task()` function.
The worker polls Supabase for queued jobs, claims them atomically, runs the task,
and updates the job status/progress/logs/result.

Environment Variables Required:
  SUPABASE_URL              - Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY - Service role key (never expose to browser)
  WORKER_ID                 - Unique identifier for this worker instance
  WORKER_SHARED_SECRET      - Shared secret for /api/worker/heartbeat
  PORTAL_USERNAME           - Work portal login username (never commit)
  PORTAL_PASSWORD           - Work portal login password (never commit)
  PORTAL_URL                - Work portal base URL (never commit)

Usage:
  pip install supabase python-dotenv playwright
  playwright install chromium
  python worker_skeleton.py
"""

import os
import time
import json
import logging
import traceback
from datetime import datetime, timezone

from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ─── Config ─────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
WORKER_ID = os.environ.get("WORKER_ID", "home-worker-01")
WORKER_SHARED_SECRET = os.environ.get("WORKER_SHARED_SECRET", "")
POLL_INTERVAL_SECONDS = int(os.environ.get("POLL_INTERVAL_SECONDS", "10"))
HEARTBEAT_INTERVAL_SECONDS = int(os.environ.get("HEARTBEAT_INTERVAL_SECONDS", "30"))

# ─── Supabase Client (service role only — never in browser) ────────────────

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# ─── Helpers ─────────────────────────────────────────────────────────────────

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_log(job_id: str, level: str, message: str, metadata: dict = None):
    """Insert a log entry into automation_logs. Never log secrets."""
    if metadata is None:
        metadata = {}
    try:
        supabase.table("automation_logs").insert({
            "job_id": job_id,
            "level": level,  # info | warning | error | success
            "message": message,
            "metadata": metadata,
        }).execute()
        logger.info(f"[{level.upper()}] {message}")
    except Exception as e:
        logger.error(f"Failed to write log: {e}")


def update_job(job_id: str, **kwargs):
    """Update job fields."""
    try:
        supabase.table("automation_jobs").update(kwargs).eq("id", job_id).execute()
    except Exception as e:
        logger.error(f"Failed to update job {job_id}: {e}")


def is_cancel_requested(job_id: str) -> bool:
    """Check if the dashboard has requested cancellation for this job."""
    try:
        res = supabase.table("automation_jobs").select("cancel_requested").eq("id", job_id).single().execute()
        return bool(res.data.get("cancel_requested", False))
    except Exception:
        return False


def send_heartbeat():
    """POST heartbeat to dashboard API."""
    import urllib.request
    app_url = os.environ.get("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
    url = f"{app_url}/api/worker/heartbeat"
    payload = json.dumps({
        "worker_id": WORKER_ID,
        "status": "online",
        "metadata": {
            "version": "1.0.0",
            "runtime": "python-playwright",
        }
    }).encode()
    try:
        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "x-worker-secret": WORKER_SHARED_SECRET,
            },
            method="POST",
        )
        urllib.request.urlopen(req, timeout=5)
        logger.debug("Heartbeat sent")
    except Exception as e:
        logger.warning(f"Heartbeat failed: {e}")


def claim_next_job() -> dict | None:
    """Atomically claim the next queued job using the Supabase RPC function."""
    try:
        res = supabase.rpc("claim_next_queued_job", {"worker_id_input": WORKER_ID}).execute()
        return res.data  # Returns job dict or None
    except Exception as e:
        logger.error(f"Error claiming job: {e}")
        return None


# ─── Task Dispatcher ──────────────────────────────────────────────────────────

def run_task(job: dict) -> dict:
    """
    Dispatch to the appropriate automation handler based on task_name.
    
    Replace/extend this with your actual business logic.
    Returns a result dict matching the JobResult schema.
    """
    task_name = job["task_name"]
    params = job.get("params", {})
    job_id = job["id"]

    logger.info(f"Running task: {task_name} (job={job_id})")

    handlers = {
        "inventory_adjustment": run_inventory_adjustment,
        "sales_extraction": run_sales_extraction,
        "promotion_comparison": run_promotion_comparison,
        "stock_mutation": run_stock_mutation,
        "clearance_stock": run_clearance_stock,
        "initial_stock": run_initial_stock,
    }

    handler = handlers.get(task_name)
    if not handler:
        raise ValueError(f"Unknown task_name: {task_name}")

    return handler(job_id, params)


# ─── Task Handlers (wrap your existing Playwright logic here) ─────────────────

def run_inventory_adjustment(job_id: str, params: dict) -> dict:
    """Wrap existing inventory adjustment Playwright logic here."""
    write_log(job_id, "info", "Starting inventory adjustment", {"step": "init"})

    # TODO: Call your existing playwright_engine.py logic here
    # from playwright_engine import run_inventory_adjustment as _run
    # result = _run(...)

    # Example progress updates — call between major steps
    update_job(job_id, progress=25)
    write_log(job_id, "info", "Logged into portal", {"step": "login"})

    if is_cancel_requested(job_id):
        raise CancelledError("Job cancelled by user")

    update_job(job_id, progress=75)
    write_log(job_id, "info", "Adjustments submitted", {"step": "submit"})
    update_job(job_id, progress=100)

    return {
        "total_records": 0,
        "processed_records": 0,
        "success_count": 0,
        "failed_count": 0,
        "summary": "Inventory adjustment completed",
    }


def run_sales_extraction(job_id: str, params: dict) -> dict:
    write_log(job_id, "info", "Starting sales extraction", {"step": "init"})
    # TODO: wrap existing sales extraction logic
    return {"summary": "Sales extraction completed"}


def run_promotion_comparison(job_id: str, params: dict) -> dict:
    write_log(job_id, "info", "Starting promotion comparison", {"step": "init"})
    # TODO: wrap existing promotion comparison logic
    return {"summary": "Promotion comparison completed"}


def run_stock_mutation(job_id: str, params: dict) -> dict:
    write_log(job_id, "info", "Starting stock mutation", {"step": "init"})
    return {"summary": "Stock mutation completed"}


def run_clearance_stock(job_id: str, params: dict) -> dict:
    write_log(job_id, "info", "Starting clearance stock", {"step": "init"})
    return {"summary": "Clearance stock completed"}


def run_initial_stock(job_id: str, params: dict) -> dict:
    write_log(job_id, "info", "Starting initial stock", {"step": "init"})
    return {"summary": "Initial stock completed"}


# ─── Custom Exceptions ────────────────────────────────────────────────────────

class CancelledError(Exception):
    pass


# ─── Main Worker Loop ─────────────────────────────────────────────────────────

def process_job(job: dict):
    job_id = job["id"]
    started = time.time()

    try:
        write_log(job_id, "info", f"Worker {WORKER_ID} claimed job", {"worker_id": WORKER_ID})

        result = run_task(job)

        duration_seconds = round(time.time() - started)
        result["duration_seconds"] = duration_seconds

        update_job(
            job_id,
            status="success",
            progress=100,
            result=result,
            finished_at=now_iso(),
        )
        write_log(job_id, "success", f"Job completed in {duration_seconds}s", {"step": "done"})

    except CancelledError as e:
        write_log(job_id, "warning", str(e))
        update_job(job_id, status="cancelled", finished_at=now_iso())

    except Exception as e:
        error_msg = traceback.format_exc()
        # Never log secrets — ensure error_msg doesn't contain credentials
        write_log(job_id, "error", f"Job failed: {e}", {"step": "error"})
        update_job(
            job_id,
            status="failed",
            error_message=str(e)[:2000],  # Truncate to avoid huge payloads
            finished_at=now_iso(),
        )


def main():
    logger.info(f"Worker {WORKER_ID} starting…")
    last_heartbeat = 0

    while True:
        now = time.time()

        # Send heartbeat periodically
        if now - last_heartbeat >= HEARTBEAT_INTERVAL_SECONDS:
            send_heartbeat()
            last_heartbeat = now

        # Try to claim a job
        job = claim_next_job()
        if not job:
            logger.debug("No queued jobs. Sleeping…")
            time.sleep(POLL_INTERVAL_SECONDS)
            continue

        process_job(job)


if __name__ == "__main__":
    main()
