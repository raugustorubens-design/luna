/**
 * `provider` is a dev-only escape hatch to force a specific adapter. It's
 * read from the raw body (not the zod schema, which the public contract
 * doesn't include it in) and only honored when the caller identifies itself
 * as a dev client via `X-Luna-Dev-Mode: true` — anyone else's `provider`
 * field is silently ignored and the normal fallback order is used.
 */
export function resolveProviderOverride(
  body: unknown,
  devModeHeader: string | string[] | undefined,
): string | undefined {
  if (devModeHeader !== "true") return undefined;
  if (!body || typeof body !== "object") return undefined;

  const provider = (body as Record<string, unknown>).provider;
  return typeof provider === "string" && provider.trim() ? provider : undefined;
}
