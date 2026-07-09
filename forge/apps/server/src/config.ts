/**
 * Local configuration only — where the developer's running LUNA backend
 * (Gateway + Cognitive Engine) lives, and which local directory the
 * Explorer/Editor/Terminal operate against. Never a database URL, never a
 * provider API key: this server has no business knowing either.
 */
export const config = {
  port: Number(process.env.FORGE_SERVER_PORT ?? 4100),
  lunaApiBaseUrl: process.env.LUNA_API_BASE_URL ?? "http://localhost:3001/api",
  workingDirectory: process.env.FORGE_WORKING_DIRECTORY ?? process.cwd(),
};
