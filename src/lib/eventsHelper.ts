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
    let target: Date;
    if (dateStr.includes("T")) {
      target = new Date(dateStr);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      target = new Date(`${dateStr.trim()}T23:59:59`);
    } else {
      target = new Date(dateStr);
      if (!isNaN(target.getTime()) && !dateStr.includes(":")) {
        target.setHours(23, 59, 59, 999);
      }
    }

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
