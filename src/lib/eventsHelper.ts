/**
 * Utility functions for automatic event status determination and classification.
 */

/**
 * Checks whether an event's date has passed.
 * If date is in 'YYYY-MM-DD' format, compares with the end of that day.
 */
export function isEventPast(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const target = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T23:59:59`);
    if (isNaN(target.getTime())) return false;
    return target.getTime() < Date.now();
  } catch {
    return false;
  }
}

/**
 * Derives the automated status label for an event.
 */
export function getAutoEventStatus(dateStr: string, manualStatus?: string): string {
  if (isEventPast(dateStr)) {
    return "COMPLETED";
  }
  return manualStatus && manualStatus !== "COMPLETED" ? manualStatus : "UPCOMING";
}
