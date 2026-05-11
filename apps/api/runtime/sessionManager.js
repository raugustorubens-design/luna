const sessions = new Map();

export function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      session_id: sessionId,

      current_page: null,

      active_goal: null,

      recent_messages: [],

      signals: [],

      operational_context: {},

      created_at: Date.now(),

      updated_at: Date.now()
    });
  }

  return sessions.get(sessionId);
}

export function updateSession(sessionId, data) {
  const session = getSession(sessionId);

  const updated = {
    ...session,
    ...data,
    updated_at: Date.now()
  };

  sessions.set(sessionId, updated);

  return updated;
}