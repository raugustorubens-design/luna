import assert from "node:assert/strict";
import test from "node:test";
import { assembleContext } from "../context-hub";

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
