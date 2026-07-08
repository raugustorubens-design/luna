import assert from "node:assert/strict";
import test from "node:test";
import { GithubReadFileCapability } from "../capabilities/github/read-file";
import type {
  FilesystemAdapter,
  FilesystemDeleteInput,
  FilesystemDeleteOutput,
  FilesystemDiffInput,
  FilesystemDiffOutput,
  FilesystemExistsInput,
  FilesystemExistsOutput,
  FilesystemListInput,
  FilesystemListOutput,
  FilesystemReadInput,
  FilesystemReadOutput,
  FilesystemSearchInput,
  FilesystemSearchOutput,
  FilesystemWriteInput,
  FilesystemWriteOutput,
  GithubAdapter,
  GithubCloseIssueInput,
  GithubCloseIssueOutput,
  GithubClosePullRequestInput,
  GithubClosePullRequestOutput,
  GithubCommentPullRequestInput,
  GithubCommentPullRequestOutput,
  GithubCommitInput,
  GithubCommitOutput,
  GithubCompareCommitsInput,
  GithubCompareCommitsOutput,
  GithubCreateBranchInput,
  GithubCreateBranchOutput,
  GithubCreateIssueInput,
  GithubCreateIssueOutput,
  GithubCreatePullRequestInput,
  GithubCreatePullRequestOutput,
  GithubDeleteBranchInput,
  GithubDeleteBranchOutput,
  GithubDeleteCommentInput,
  GithubDeleteCommentOutput,
  GithubDeleteFileInput,
  GithubDeleteFileOutput,
  GithubListBranchesInput,
  GithubListBranchesOutput,
  GithubListCommitsInput,
  GithubListCommitsOutput,
  GithubListPullRequestsInput,
  GithubListPullRequestsOutput,
  GithubReadFileInput,
  GithubReadFileOutput,
  GithubWriteFileInput,
  GithubWriteFileOutput,
} from "../contracts";
import { isRollbackableCapability } from "../contracts";
import { CapabilityRegistry } from "../registry/capability-registry";
import { GithubWriteFileCapability } from "../capabilities/github/write-file";
import { GithubCreateBranchCapability } from "../capabilities/github/create-branch";
import { GithubCommitCapability } from "../capabilities/github/commit";
import { GithubCreatePullRequestCapability } from "../capabilities/github/create-pull-request";
import { GithubListBranchesCapability } from "../capabilities/github/list-branches";
import { GithubListPullRequestsCapability } from "../capabilities/github/list-pull-requests";
import { GithubListCommitsCapability } from "../capabilities/github/list-commits";
import { GithubCompareCommitsCapability } from "../capabilities/github/compare-commits";
import { GithubCreateIssueCapability } from "../capabilities/github/create-issue";
import { GithubCommentPullRequestCapability } from "../capabilities/github/comment-pull-request";
import { FilesystemReadCapability } from "../capabilities/filesystem/read";
import { FilesystemWriteCapability } from "../capabilities/filesystem/write";
import { FilesystemListCapability } from "../capabilities/filesystem/list";
import { FilesystemSearchCapability } from "../capabilities/filesystem/search";
import { FilesystemDiffCapability } from "../capabilities/filesystem/diff";
import { FilesystemExistsCapability } from "../capabilities/filesystem/exists";

class StubGithubAdapter implements GithubAdapter {
  public deletedBranches: string[] = [];
  public closedPullRequests: number[] = [];
  public closedIssues: number[] = [];
  public deletedComments: number[] = [];
  public deletedFiles: string[] = [];
  public writes: GithubWriteFileInput[] = [];

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

  async writeFile(input: GithubWriteFileInput): Promise<GithubWriteFileOutput> {
    this.writes.push(input);
    return {
      owner: input.owner,
      repo: input.repo,
      path: input.path,
      branch: input.branch ?? "main",
      sha: "new-sha",
      previousSha: input.sha ?? null,
      previousContent: input.sha ? "previous content" : null,
      commitSha: "commit-sha",
      htmlUrl: `https://github.com/${input.owner}/${input.repo}/blob/${input.branch ?? "main"}/${input.path}`,
    };
  }

  async deleteFile(input: GithubDeleteFileInput): Promise<GithubDeleteFileOutput> {
    this.deletedFiles.push(input.path);
    return { owner: input.owner, repo: input.repo, path: input.path, branch: input.branch ?? "main", commitSha: "delete-commit-sha" };
  }

  async createBranch(input: GithubCreateBranchInput): Promise<GithubCreateBranchOutput> {
    return {
      owner: input.owner,
      repo: input.repo,
      branch: input.branch,
      ref: `refs/heads/${input.branch}`,
      sha: "branch-sha",
      htmlUrl: `https://github.com/${input.owner}/${input.repo}/tree/${input.branch}`,
    };
  }

  async deleteBranch(input: GithubDeleteBranchInput): Promise<GithubDeleteBranchOutput> {
    this.deletedBranches.push(input.branch);
    return { owner: input.owner, repo: input.repo, branch: input.branch };
  }

  async commit(input: GithubCommitInput): Promise<GithubCommitOutput> {
    return {
      owner: input.owner,
      repo: input.repo,
      branch: input.branch,
      sha: "commit-sha",
      treeSha: "tree-sha",
      parentSha: "parent-sha",
      htmlUrl: `https://github.com/${input.owner}/${input.repo}/commit/commit-sha`,
    };
  }

  async createPullRequest(input: GithubCreatePullRequestInput): Promise<GithubCreatePullRequestOutput> {
    return { owner: input.owner, repo: input.repo, number: 42, state: "open", htmlUrl: `https://github.com/${input.owner}/${input.repo}/pull/42` };
  }

  async closePullRequest(input: GithubClosePullRequestInput): Promise<GithubClosePullRequestOutput> {
    this.closedPullRequests.push(input.number);
    return { owner: input.owner, repo: input.repo, number: input.number, state: "closed" };
  }

  async listBranches(input: GithubListBranchesInput): Promise<GithubListBranchesOutput> {
    return { owner: input.owner, repo: input.repo, branches: [{ name: "main", sha: "main-sha", protected: true }] };
  }

  async listPullRequests(input: GithubListPullRequestsInput): Promise<GithubListPullRequestsOutput> {
    return {
      owner: input.owner,
      repo: input.repo,
      pullRequests: [{ number: 1, title: "Test PR", state: "open", head: "feature", base: "main", htmlUrl: "https://github.com/luna/organism/pull/1" }],
    };
  }

  async listCommits(input: GithubListCommitsInput): Promise<GithubListCommitsOutput> {
    return {
      owner: input.owner,
      repo: input.repo,
      commits: [{ sha: "sha1", message: "init", author: "luna", authoredAt: new Date().toISOString(), htmlUrl: "https://github.com/luna/organism/commit/sha1" }],
    };
  }

  async compareCommits(input: GithubCompareCommitsInput): Promise<GithubCompareCommitsOutput> {
    return {
      owner: input.owner,
      repo: input.repo,
      base: input.base,
      head: input.head,
      status: "ahead",
      aheadBy: 1,
      behindBy: 0,
      totalCommits: 1,
      files: [{ filename: "README.md", status: "modified", additions: 1, deletions: 0, changes: 1 }],
      htmlUrl: `https://github.com/${input.owner}/${input.repo}/compare/${input.base}...${input.head}`,
    };
  }

  async createIssue(input: GithubCreateIssueInput): Promise<GithubCreateIssueOutput> {
    return { owner: input.owner, repo: input.repo, number: 7, state: "open", htmlUrl: `https://github.com/${input.owner}/${input.repo}/issues/7` };
  }

  async closeIssue(input: GithubCloseIssueInput): Promise<GithubCloseIssueOutput> {
    this.closedIssues.push(input.number);
    return { owner: input.owner, repo: input.repo, number: input.number, state: "closed" };
  }

  async commentPullRequest(input: GithubCommentPullRequestInput): Promise<GithubCommentPullRequestOutput> {
    return {
      owner: input.owner,
      repo: input.repo,
      number: input.number,
      commentId: 99,
      htmlUrl: `https://github.com/${input.owner}/${input.repo}/pull/${input.number}#issuecomment-99`,
    };
  }

  async deleteComment(input: GithubDeleteCommentInput): Promise<GithubDeleteCommentOutput> {
    this.deletedComments.push(input.commentId);
    return { owner: input.owner, repo: input.repo, commentId: input.commentId };
  }
}

class StubFilesystemAdapter implements FilesystemAdapter {
  public files = new Map<string, string>([["notes/todo.txt", "buy milk"]]);
  public deleted: string[] = [];

  async read(input: FilesystemReadInput): Promise<FilesystemReadOutput> {
    const content = this.files.get(input.path);
    if (content === undefined) throw new Error(`not found: ${input.path}`);
    return { path: input.path, content, encoding: input.encoding ?? "utf8", size: content.length };
  }

  async write(input: FilesystemWriteInput): Promise<FilesystemWriteOutput> {
    const previousContent = this.files.get(input.path) ?? null;
    this.files.set(input.path, input.content);
    return { path: input.path, size: input.content.length, created: previousContent === null, previousContent };
  }

  async delete(input: FilesystemDeleteInput): Promise<FilesystemDeleteOutput> {
    this.files.delete(input.path);
    this.deleted.push(input.path);
    return { path: input.path };
  }

  async list(input: FilesystemListInput): Promise<FilesystemListOutput> {
    return { path: input.path, entries: [{ name: "todo.txt", path: "notes/todo.txt", type: "file", size: 8 }] };
  }

  async search(input: FilesystemSearchInput): Promise<FilesystemSearchOutput> {
    return { path: input.path, pattern: input.pattern, matches: [{ file: "notes/todo.txt", line: 1, text: "buy milk" }] };
  }

  async diff(input: FilesystemDiffInput): Promise<FilesystemDiffOutput> {
    return { basePath: input.basePath, comparePath: input.comparePath, identical: false, diff: "--- a\n+++ b\n-old\n+new" };
  }

  async exists(input: FilesystemExistsInput): Promise<FilesystemExistsOutput> {
    return { path: input.path, exists: this.files.has(input.path), type: this.files.has(input.path) ? "file" : null };
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

test("github.write_file writes through the adapter and rolls back by restoring previous content", async () => {
  const github = new StubGithubAdapter();
  const capability = new GithubWriteFileCapability(github);
  const registry = new CapabilityRegistry();
  registry.register(capability);

  const result = await registry.execute({
    capability: "github.write_file",
    input: { owner: "luna", repo: "organism", path: "docs/notes.md", content: "updated", message: "update notes", sha: "old-sha" },
  });

  assert.equal(result.success, true);
  const output = result.output as GithubWriteFileOutput;
  assert.equal(output.previousContent, "previous content");

  assert.ok(isRollbackableCapability(capability));
  const rollback = await capability.rollback(output);
  assert.equal(rollback.success, true);
  assert.equal(github.writes.length, 2);
  assert.equal(github.writes[1]?.content, "previous content");
});

test("github.write_file rollback deletes the file when it was newly created", async () => {
  const github = new StubGithubAdapter();
  const capability = new GithubWriteFileCapability(github);

  const result = await capability.execute({
    capability: "github.write_file",
    input: { owner: "luna", repo: "organism", path: "docs/new.md", content: "new file", message: "add notes" },
  });

  const output = result.output as GithubWriteFileOutput;
  assert.equal(output.previousContent, null);

  await capability.rollback(output);
  assert.deepEqual(github.deletedFiles, ["docs/new.md"]);
});

test("github.create_branch supports rollback by deleting the branch", async () => {
  const github = new StubGithubAdapter();
  const capability = new GithubCreateBranchCapability(github);

  const result = await capability.execute({
    capability: "github.create_branch",
    input: { owner: "luna", repo: "organism", branch: "feature/x" },
  });

  const output = result.output as GithubCreateBranchOutput;
  await capability.rollback(output);
  assert.deepEqual(github.deletedBranches, ["feature/x"]);
});

test("github.commit does not support rollback", () => {
  const capability = new GithubCommitCapability(new StubGithubAdapter());
  assert.equal(capability.manifest.supportsRollback, false);
  assert.equal(isRollbackableCapability(capability), false);
});

test("github.create_pull_request supports rollback by closing the PR", async () => {
  const github = new StubGithubAdapter();
  const capability = new GithubCreatePullRequestCapability(github);

  const result = await capability.execute({
    capability: "github.create_pull_request",
    input: { owner: "luna", repo: "organism", title: "Add feature", head: "feature/x", base: "main" },
  });

  const output = result.output as GithubCreatePullRequestOutput;
  await capability.rollback(output);
  assert.deepEqual(github.closedPullRequests, [42]);
});

test("github.list_branches is read-only and returns evidence", async () => {
  const capability = new GithubListBranchesCapability(new StubGithubAdapter());
  const result = await capability.execute({ capability: "github.list_branches", input: { owner: "luna", repo: "organism" } });

  assert.equal(result.success, true);
  assert.equal((result.output as GithubListBranchesOutput).branches.length, 1);
  assert.equal(result.evidence.length, 1);
});

test("github.list_pull_requests is read-only", async () => {
  const capability = new GithubListPullRequestsCapability(new StubGithubAdapter());
  const result = await capability.execute({ capability: "github.list_pull_requests", input: { owner: "luna", repo: "organism" } });

  assert.equal(result.success, true);
  assert.equal((result.output as GithubListPullRequestsOutput).pullRequests[0]?.number, 1);
});

test("github.list_commits is read-only", async () => {
  const capability = new GithubListCommitsCapability(new StubGithubAdapter());
  const result = await capability.execute({ capability: "github.list_commits", input: { owner: "luna", repo: "organism" } });

  assert.equal(result.success, true);
  assert.equal((result.output as GithubListCommitsOutput).commits[0]?.sha, "sha1");
});

test("github.compare_commits is read-only", async () => {
  const capability = new GithubCompareCommitsCapability(new StubGithubAdapter());
  const result = await capability.execute({
    capability: "github.compare_commits",
    input: { owner: "luna", repo: "organism", base: "main", head: "feature/x" },
  });

  assert.equal(result.success, true);
  assert.equal((result.output as GithubCompareCommitsOutput).aheadBy, 1);
});

test("github.create_issue supports rollback by closing the issue", async () => {
  const github = new StubGithubAdapter();
  const capability = new GithubCreateIssueCapability(github);

  const result = await capability.execute({
    capability: "github.create_issue",
    input: { owner: "luna", repo: "organism", title: "Bug report" },
  });

  const output = result.output as GithubCreateIssueOutput;
  await capability.rollback(output);
  assert.deepEqual(github.closedIssues, [7]);
});

test("github.comment_pull_request supports rollback by deleting the comment", async () => {
  const github = new StubGithubAdapter();
  const capability = new GithubCommentPullRequestCapability(github);

  const result = await capability.execute({
    capability: "github.comment_pull_request",
    input: { owner: "luna", repo: "organism", number: 42, body: "LGTM" },
  });

  const output = result.output as GithubCommentPullRequestOutput;
  await capability.rollback(output);
  assert.deepEqual(github.deletedComments, [99]);
});

test("filesystem.read reads through the filesystem adapter", async () => {
  const capability = new FilesystemReadCapability(new StubFilesystemAdapter());
  const result = await capability.execute({ capability: "filesystem.read", input: { path: "notes/todo.txt" } });

  assert.equal(result.success, true);
  assert.equal((result.output as FilesystemReadOutput).content, "buy milk");
});

test("filesystem.write supports rollback by restoring previous content", async () => {
  const filesystem = new StubFilesystemAdapter();
  const capability = new FilesystemWriteCapability(filesystem);

  const result = await capability.execute({ capability: "filesystem.write", input: { path: "notes/todo.txt", content: "buy eggs" } });
  const output = result.output as FilesystemWriteOutput;
  assert.equal(output.created, false);
  assert.equal(output.previousContent, "buy milk");

  await capability.rollback(output);
  assert.equal((await filesystem.read({ path: "notes/todo.txt" })).content, "buy milk");
});

test("filesystem.write rollback deletes the file when it was newly created", async () => {
  const filesystem = new StubFilesystemAdapter();
  const capability = new FilesystemWriteCapability(filesystem);

  const result = await capability.execute({ capability: "filesystem.write", input: { path: "notes/new.txt", content: "hi" } });
  const output = result.output as FilesystemWriteOutput;
  assert.equal(output.created, true);

  await capability.rollback(output);
  assert.deepEqual(filesystem.deleted, ["notes/new.txt"]);
});

test("filesystem.list, filesystem.search, filesystem.diff and filesystem.exists are read-only", async () => {
  const filesystem = new StubFilesystemAdapter();

  const listResult = await new FilesystemListCapability(filesystem).execute({ capability: "filesystem.list", input: { path: "notes" } });
  assert.equal((listResult.output as FilesystemListOutput).entries.length, 1);

  const searchResult = await new FilesystemSearchCapability(filesystem).execute({
    capability: "filesystem.search",
    input: { path: "notes", pattern: "milk" },
  });
  assert.equal((searchResult.output as FilesystemSearchOutput).matches.length, 1);

  const diffResult = await new FilesystemDiffCapability(filesystem).execute({
    capability: "filesystem.diff",
    input: { basePath: "a.txt", comparePath: "b.txt" },
  });
  assert.equal((diffResult.output as FilesystemDiffOutput).identical, false);

  const existsResult = await new FilesystemExistsCapability(filesystem).execute({
    capability: "filesystem.exists",
    input: { path: "notes/todo.txt" },
  });
  assert.equal((existsResult.output as FilesystemExistsOutput).exists, true);
});

test("gateway registry registers and discovers the full github and filesystem capability packs", () => {
  const registry = new CapabilityRegistry();
  const github = new StubGithubAdapter();
  const filesystem = new StubFilesystemAdapter();

  registry.register(new GithubReadFileCapability(github));
  registry.register(new GithubWriteFileCapability(github));
  registry.register(new GithubCreateBranchCapability(github));
  registry.register(new GithubCommitCapability(github));
  registry.register(new GithubCreatePullRequestCapability(github));
  registry.register(new GithubListBranchesCapability(github));
  registry.register(new GithubListPullRequestsCapability(github));
  registry.register(new GithubListCommitsCapability(github));
  registry.register(new GithubCompareCommitsCapability(github));
  registry.register(new GithubCreateIssueCapability(github));
  registry.register(new GithubCommentPullRequestCapability(github));
  registry.register(new FilesystemReadCapability(filesystem));
  registry.register(new FilesystemWriteCapability(filesystem));
  registry.register(new FilesystemListCapability(filesystem));
  registry.register(new FilesystemSearchCapability(filesystem));
  registry.register(new FilesystemDiffCapability(filesystem));
  registry.register(new FilesystemExistsCapability(filesystem));

  const ids = registry.discover().map((manifest) => manifest.id);
  assert.deepEqual(
    ids,
    [
      "filesystem.diff",
      "filesystem.exists",
      "filesystem.list",
      "filesystem.read",
      "filesystem.search",
      "filesystem.write",
      "github.comment_pull_request",
      "github.commit",
      "github.compare_commits",
      "github.create_branch",
      "github.create_issue",
      "github.create_pull_request",
      "github.list_branches",
      "github.list_commits",
      "github.list_pull_requests",
      "github.read_file",
      "github.write_file",
    ].sort(),
  );
});
