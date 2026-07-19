import assert from "node:assert/strict";
import test from "node:test";
import { assembleContext, buildOrganismContext } from "../context-hub";

test("assembleContext produces the shared context every provider must consume", async () => {
  const memories = [{ tipo: "interaction", conteudo: { user_message: "oi" } }];
  const context = await assembleContext(memories, "olá luna");

  assert.equal(context.current_message, "olá luna");
  assert.deepEqual(context.memories, memories);
  assert.equal(context.identity.name, "LUNA");
  assert.equal(typeof context.identity.mission, "string");
  assert.ok(Array.isArray(context.evolutiveContext));
  assert.ok(Array.isArray(context.openTasks));
  assert.ok(Array.isArray(context.roadmap));
  assert.deepEqual(context.cognitiveAttractors, []);
  assert.ok(Array.isArray(context.sync.cognitiveIndexRefs));
  assert.deepEqual(context.sync.checkpointRefs, []);
  assert.deepEqual(context.sync.reconstructionRefs, []);
});

test("buildOrganismContext reconstructs real project state from real files, not fabricated data", async () => {
  const context = await buildOrganismContext();

  assert.equal(context.project, "LUNA");
  // RUNTIME_STATE.md is checked in with real content (same file
  // readProjectContext already depends on) — this fails loudly if path
  // resolution regresses, same reasoning as indice-cognitivo.test.ts.
  assert.notEqual(context.architecturalState, "estado do projeto não disponível");
  assert.ok(context.mission.length > 0, "mission must be extracted from LUNA_CONTEXT.md, not empty");
  assert.ok(context.currentMvp.length > 0, "currentMvp must be the last numbered section heading");
  assert.ok(Array.isArray(context.cognitiveIndex));
  assert.ok(Array.isArray(context.checkpoints));
  assert.ok(Array.isArray(context.inferences));
  // forge/ROADMAP.md is real and non-empty — this must not silently fall
  // back to the empty luna_context/ROADMAP.md scaffold.
  assert.ok(context.roadmap.some((item) => item.includes("Forge MVP-")), "roadmap must reflect forge/ROADMAP.md");
  assert.ok(context.activeRepositories.every((repo) => repo.startsWith("raugustorubens-design/")));
  assert.ok(context.activeSystems.includes("Gateway"), "activeSystems must reflect the real organ list in LUNA_CONTEXT.md §1");
  assert.equal(context.providers.length, 5);
  // "configured" depends on env credentials present at runtime, not a
  // structural fact this test can assume — only shape/presence is checked.
  assert.ok(context.providers.some((provider) => provider.id === "groq"));
  assert.ok(context.providers.every((provider) => typeof provider.configured === "boolean"));
});

test("buildOrganismContext never throws even when Supabase/checkpoints are unreachable", async () => {
  // This sandbox's network allowlist rejects the real Supabase host outright
  // (audited manually before implementing — see LUNA_CONTEXT.md) — this test
  // documents that buildOrganismContext must degrade to an empty checkpoints
  // list in that case rather than propagate the error, exactly like
  // retrieveMemory already does for the memories path.
  const context = await buildOrganismContext();
  assert.ok(Array.isArray(context.checkpoints));
});
