import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { readProjectContext } from "../indice-cognitivo";

test("readProjectContext returns safe empty defaults when no context files exist", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "luna-indice-"));
  try {
    const snapshot = await readProjectContext(dir);
    assert.equal(snapshot.state, "estado do projeto não disponível");
    assert.deepEqual(snapshot.evolutiveContext, []);
    assert.deepEqual(snapshot.openTasks, []);
    assert.deepEqual(snapshot.roadmap, []);
    assert.deepEqual(snapshot.cognitiveIndexRefs, []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("readProjectContext extracts list items and refs from present files only", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "luna-indice-"));
  try {
    await writeFile(path.join(dir, "RUNTIME_STATE.md"), "# estado\nfoo bar baz");
    await writeFile(path.join(dir, "ROADMAP.md"), "- fazer X\n- fazer Y\nnão é item de lista");

    const snapshot = await readProjectContext(dir);

    assert.match(snapshot.state, /estado/);
    assert.deepEqual(snapshot.roadmap, ["- fazer X", "- fazer Y"]);
    assert.deepEqual(snapshot.openTasks, ["- fazer X", "- fazer Y"]);
    assert.deepEqual(snapshot.evolutiveContext, []);
    assert.deepEqual(snapshot.cognitiveIndexRefs, ["luna_context/RUNTIME_STATE.md", "luna_context/ROADMAP.md"]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("readProjectContext default path resolves to the repo's real luna_context directory", async () => {
  const snapshot = await readProjectContext();

  // RUNTIME_STATE.md is checked in with real content; ARCHITECTURE.md/DECISIONS.md/
  // ROADMAP.md are known-empty per the architecture audit — this assertion fails
  // loudly if the path resolution ever regresses back to a cwd-dependent guess.
  assert.notEqual(snapshot.state, "estado do projeto não disponível");
  assert.ok(snapshot.cognitiveIndexRefs.includes("luna_context/RUNTIME_STATE.md"));
});
