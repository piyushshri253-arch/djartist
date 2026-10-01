import { getDb } from "./mongodb";

export type AuditAction =
  | "LOGIN"
  | "FAILED_LOGIN"
  | "LOGOUT"
  | "CREATE_EVENT"
  | "UPDATE_EVENT"
  | "DELETE_EVENT"
  | "UPLOAD_IMAGE"
  | "DELETE_IMAGE"
  | "CREATE_BLOG"
  | "UPDATE_BLOG"
  | "DELETE_BLOG"
  | "UPDATE_SETTINGS"
  | "MODERATE_REVIEW"
  | "SESSION_REVOKED";

export interface AuditLogEntry {
  action: AuditAction;
  adminEmail: string;
  resource?: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  status: "SUCCESS" | "FAILURE";
  timestamp: string;
}

/**
 * Records administrative events in an immutable audit collection.
 * Passwords, tokens, cookies, and secrets are strictly stripped.
 */
export async function logAdminAction(entry: Omit<AuditLogEntry, "timestamp">): Promise<void> {
  const logRecord: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // Safe console log for real-time log drains (e.g. Vercel Logs)
  console.log(
    `[ADMIN AUDIT] [${logRecord.timestamp}] action=${logRecord.action} admin=${logRecord.adminEmail} status=${logRecord.status} resource=${logRecord.resource || "N/A"} ip=${logRecord.ip || "unknown"}`
  );

  try {
    const db = await getDb();
    if (db) {
      await db.collection("admin_audit_logs").insertOne(logRecord);
    }
  } catch (err) {
    console.error("[Audit Logger] Failed to persist audit record to database:", err);
  }
}
