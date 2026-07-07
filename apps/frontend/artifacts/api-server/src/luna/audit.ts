import { logger } from "../lib/logger";
import type { AuditEvent } from "./contracts";

export function emitAudit(event: Omit<AuditEvent, "at">): AuditEvent {
  const auditEvent: AuditEvent = {
    ...event,
    at: new Date().toISOString(),
  };

  logger.info({ audit: auditEvent }, "LUNA audit event");

  return auditEvent;
}
