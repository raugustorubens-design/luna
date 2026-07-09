import { z } from "zod";

/**
 * Projeto Renascer — contract-only, per Prompt 2 instructions.
 *
 * Not implemented, not wired to any route or gateway capability. This exists
 * so the frontend has a stable shape to code against once a real generation
 * backend exists, and so any future implementation is forced through a typed
 * request instead of an arbitrary object.
 *
 * Context: the audit found that `raugustorubens-design/projeto-renascer`
 * currently contains a single auto-generated commit whose payload was
 * `[object Object]` — an unserialized object reached wherever that generator
 * builds its request. A strict schema here is the concrete fix for that bug
 * class: any caller passing a raw object instead of a structured request
 * will fail validation instead of silently stringifying into garbage.
 */

export const RenascerProjectType = z.enum([
  "landing_page",
  "web_app",
  "api_service",
  "cli_tool",
  "static_site",
  "other",
]);
export type RenascerProjectType = z.infer<typeof RenascerProjectType>;

export const RenascerGenerationRequest = z.object({
  description: z.string().min(10, "Descreva o projeto com pelo menos 10 caracteres"),
  projectType: RenascerProjectType,
  language: z.string().optional(),
  framework: z.string().optional(),
  features: z.array(z.string()).default([]),
});
export type RenascerGenerationRequest = z.infer<typeof RenascerGenerationRequest>;

export const RenascerGenerationStatus = z.enum(["queued", "generating", "ready", "failed"]);
export type RenascerGenerationStatus = z.infer<typeof RenascerGenerationStatus>;

export const RenascerGenerationResult = z.object({
  id: z.string(),
  status: RenascerGenerationStatus,
  repositoryUrl: z.string().url().optional(),
  error: z.string().optional(),
  createdAt: z.string(),
});
export type RenascerGenerationResult = z.infer<typeof RenascerGenerationResult>;
