// Scheduler module - manages monitoring job scheduling
import * as db from "./db";

const jobIntervals = new Map<string, NodeJS.Timeout>();

export async function triggerJob(jobId: string) {
  const job = await db.getMonitoringJobById(jobId);
  if (!job) throw new Error("Job not found");
  await db.updateMonitoringJobStatus(jobId, "running");
  setTimeout(async () => {
    await db.updateMonitoringJobStatus(jobId, "active");
  }, 2000);
  return { success: true, message: "Job triggered successfully" };
}

export async function toggleJobStatus(jobId: string, isActive: boolean) {
  await db.updateMonitoringJobStatus(jobId, isActive ? "active" : "paused");
  if (!isActive && jobIntervals.has(jobId)) {
    clearInterval(jobIntervals.get(jobId)!);
    jobIntervals.delete(jobId);
  }
  return { success: true };
}
