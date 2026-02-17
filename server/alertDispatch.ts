// Alert Dispatch module - manages alert dispatching and stats

export async function getAlertStats() {
  return {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    resolved: 0,
    pending: 0,
  };
}

export async function dispatchAlert(alert: {
  type: string;
  severity: string;
  message: string;
  recipients?: string[];
}) {
  return { success: true, dispatched: true };
}
