import { logger } from "../lib/logger";
import type { AuditEvent } from "./contracts";

const RECENT_LIMIT = 200;
const recent: AuditEvent[] = [];

/**
 * Reporter: the organism's single observability surface for cognition events.
 * v1 keeps events in-process (ring buffer + pino log stream); persisting the
 * trail durably is a real gap identified during the architecture audit and is
 * deferred rather than solved with a new, untested table in this pass.
 */
export function emitReport(event: Omit<AuditEvent, "at">): AuditEvent {
  const reportEvent: AuditEvent = {
    ...event,
    at: new Date().toISOString(),
  };

  recent.push(reportEvent);
  if (recent.length > RECENT_LIMIT) {
    recent.shift();
  }

  logger.info({ audit: reportEvent }, "LUNA report event");

  return reportEvent;
}

export function getRecentReports(limit = 50): AuditEvent[] {
  return recent.slice(-limit);
}
