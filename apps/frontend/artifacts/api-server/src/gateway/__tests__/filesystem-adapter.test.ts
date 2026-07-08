import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { FilesystemRestAdapter } from "../adapters/filesystem-adapter";

async function withTempRoot(run: (adapter: FilesystemRestAdapter, root: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(path.join(tmpdir(), "luna-gateway-fs-"));
  try {
    await run(new FilesystemRestAdapter(root), root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("filesystem adapter writes and reads a file relative to its root", async () => {
  await withTempRoot(async (adapter) => {
    const write = await adapter.write({ path: "a/b.txt", content: "hello" });
    assert.equal(write.created, true);
    assert.equal(write.previousContent, null);

    const read = await adapter.read({ path: "a/b.txt" });
    assert.equal(read.content, "hello");
  });
});

test("filesystem adapter reports previous content and created:false on overwrite", async () => {
  await withTempRoot(async (adapter) => {
    await adapter.write({ path: "a.txt", content: "v1" });
    const write = await adapter.write({ path: "a.txt", content: "v2" });
    assert.equal(write.created, false);
    assert.equal(write.previousContent, "v1");
  });
});

test("filesystem adapter lists, searches, diffs, and checks existence", async () => {
  await withTempRoot(async (adapter) => {
    await adapter.write({ path: "notes/todo.txt", content: "buy milk\nbuy eggs" });
    await adapter.write({ path: "notes/done.txt", content: "buy milk" });

    const listing = await adapter.list({ path: "notes" });
    assert.equal(listing.entries.length, 2);

    const search = await adapter.search({ path: "notes", pattern: "eggs" });
    assert.equal(search.matches.length, 1);
    assert.equal(search.matches[0]?.file, "notes/todo.txt");

    const diff = await adapter.diff({ basePath: "notes/todo.txt", comparePath: "notes/done.txt" });
    assert.equal(diff.identical, false);
    assert.match(diff.diff, /buy eggs/);

    const exists = await adapter.exists({ path: "notes/todo.txt" });
    assert.equal(exists.exists, true);
    assert.equal(exists.type, "file");

    const missing = await adapter.exists({ path: "notes/missing.txt" });
    assert.equal(missing.exists, false);
    assert.equal(missing.type, null);
  });
});

test("filesystem adapter rejects paths that escape its root", async () => {
  await withTempRoot(async (adapter) => {
    await assert.rejects(() => adapter.read({ path: "../outside.txt" }), /escapes the filesystem adapter root/);
    await assert.rejects(() => adapter.write({ path: "../../etc/passwd", content: "x" }), /escapes the filesystem adapter root/);
  });
});

test("filesystem adapter delete removes a file", async () => {
  await withTempRoot(async (adapter) => {
    await adapter.write({ path: "a.txt", content: "v1" });
    await adapter.delete({ path: "a.txt" });
    const exists = await adapter.exists({ path: "a.txt" });
    assert.equal(exists.exists, false);
  });
});
