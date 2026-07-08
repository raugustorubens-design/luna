import assert from "node:assert/strict";
import test from "node:test";
import { GithubReadFileCapability } from "../capabilities/github/read-file";
import type { GithubAdapter, GithubReadFileInput, GithubReadFileOutput } from "../contracts";
import { CapabilityRegistry } from "../registry/capability-registry";

class StubGithubAdapter implements GithubAdapter {
  async readFile(input: GithubReadFileInput): Promise<GithubReadFileOutput> {
    return {
      owner: input.owner,
      repo: input.repo,
      path: input.path,
      ref: input.ref ?? "main",
      sha: "abc123",
      encoding: "base64",
      content: "hello luna",
      size: 10,
      htmlUrl: `https://github.com/${input.owner}/${input.repo}/blob/${input.ref ?? "main"}/${input.path}`,
    };
  }
}

test("registry discovers registered manifests automatically", () => {
  const registry = new CapabilityRegistry();
  registry.register(new GithubReadFileCapability(new StubGithubAdapter()));

  assert.deepEqual(registry.discover(), [
    {
      id: "github.read_file",
      version: 1,
      owner: "gateway",
      status: "healthy",
      requiresApproval: false,
      supportsDryRun: true,
      supportsRollback: false,
      description: "Read file from GitHub repository.",
    },
  ]);
});

test("registry executes capability through the unified request/result contract", async () => {
  const registry = new CapabilityRegistry();
  registry.register(new GithubReadFileCapability(new StubGithubAdapter()));

  const result = await registry.execute({
    capability: "github.read_file",
    input: { owner: "luna", repo: "organism", path: "README.md" },
  });

  assert.equal(result.success, true);
  assert.equal(result.capability, "github.read_file");
  assert.equal(result.version, 1);
  assert.equal(result.status, "healthy");
  assert.equal(result.dryRun, false);
  assert.equal(result.error, null);
  assert.equal((result.output as GithubReadFileOutput).content, "hello luna");
  assert.equal(result.evidence.length, 1);
});

test("github.read_file supports dry-run without invoking adapter", async () => {
  const registry = new CapabilityRegistry();
  registry.register(new GithubReadFileCapability(new StubGithubAdapter()));

  const result = await registry.execute({
    capability: "github.read_file",
    dryRun: true,
    input: { owner: "luna", repo: "organism", path: "README.md" },
  });

  assert.equal(result.success, true);
  assert.equal(result.dryRun, true);
  assert.equal(result.output, null);
  assert.deepEqual(result.evidence, []);
});

test("registry rejects unknown capabilities", async () => {
  const registry = new CapabilityRegistry();

  await assert.rejects(
    () => registry.execute({ capability: "missing.capability", input: {} }),
    /Capability is not registered/,
  );
});
