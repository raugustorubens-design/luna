import type {
  GithubAdapter,
  GithubBranchSummary,
  GithubCloseIssueInput,
  GithubCloseIssueOutput,
  GithubClosePullRequestInput,
  GithubClosePullRequestOutput,
  GithubCommentPullRequestInput,
  GithubCommentPullRequestOutput,
  GithubCommitInput,
  GithubCommitOutput,
  GithubCommitSummary,
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
  GithubPullRequestSummary,
  GithubReadFileInput,
  GithubReadFileOutput,
  GithubWriteFileInput,
  GithubWriteFileOutput,
} from "../contracts";
import { GatewayError } from "../errors/gateway-error";

interface GithubContentsFileResponse {
  type: string;
  encoding?: string;
  size: number;
  name: string;
  path: string;
  content?: string;
  sha: string;
  html_url: string;
}

export class GithubRestAdapter implements GithubAdapter {
  constructor(
    private readonly token = process.env.GITHUB_TOKEN,
    private readonly baseUrl = "https://api.github.com",
  ) {}

  async readFile(input: GithubReadFileInput): Promise<GithubReadFileOutput> {
    const ref = input.ref ?? "main";
    const data = await this.getFileContents(input.owner, input.repo, input.path, ref);

    if (Array.isArray(data) || data.type !== "file" || !data.content) {
      throw new GatewayError("GITHUB_PATH_NOT_FILE", "GitHub path did not resolve to a readable file", { path: input.path });
    }

    const encoding = data.encoding ?? "base64";
    const content = encoding === "base64" ? Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8") : data.content;

    return {
      owner: input.owner,
      repo: input.repo,
      path: data.path,
      ref,
      sha: data.sha,
      encoding,
      content,
      size: data.size,
      htmlUrl: data.html_url,
    };
  }

  async writeFile(input: GithubWriteFileInput): Promise<GithubWriteFileOutput> {
    const branch = input.branch ?? "main";
    const existing = await this.tryReadFile(input.owner, input.repo, input.path, branch);
    const previousSha = input.sha ?? existing?.sha ?? null;
    const previousContent = existing?.content ?? null;

    const body: Record<string, unknown> = {
      message: input.message,
      content: Buffer.from(input.content, "utf8").toString("base64"),
      branch,
    };
    if (previousSha) body.sha = previousSha;

    const data = await this.request<{ content: GithubContentsFileResponse; commit: { sha: string } }>(
      "PUT",
      `/repos/${input.owner}/${input.repo}/contents/${input.path}`,
      body,
      "GITHUB_WRITE_FAILED",
    );

    return {
      owner: input.owner,
      repo: input.repo,
      path: input.path,
      branch,
      sha: data.content.sha,
      previousSha,
      previousContent,
      commitSha: data.commit.sha,
      htmlUrl: data.content.html_url,
    };
  }

  async deleteFile(input: GithubDeleteFileInput): Promise<GithubDeleteFileOutput> {
    const branch = input.branch ?? "main";
    const data = await this.request<{ commit: { sha: string } }>(
      "DELETE",
      `/repos/${input.owner}/${input.repo}/contents/${input.path}`,
      { message: input.message, sha: input.sha, branch },
      "GITHUB_DELETE_FILE_FAILED",
    );

    return { owner: input.owner, repo: input.repo, path: input.path, branch, commitSha: data.commit.sha };
  }

  async createBranch(input: GithubCreateBranchInput): Promise<GithubCreateBranchOutput> {
    const fromRef = input.fromRef ?? "main";
    const base = await this.request<{ object: { sha: string } }>(
      "GET",
      `/repos/${input.owner}/${input.repo}/git/ref/heads/${fromRef}`,
      undefined,
      "GITHUB_BASE_REF_NOT_FOUND",
    );

    const created = await this.request<{ ref: string; object: { sha: string } }>(
      "POST",
      `/repos/${input.owner}/${input.repo}/git/refs`,
      { ref: `refs/heads/${input.branch}`, sha: base.object.sha },
      "GITHUB_CREATE_BRANCH_FAILED",
    );

    return {
      owner: input.owner,
      repo: input.repo,
      branch: input.branch,
      ref: created.ref,
      sha: created.object.sha,
      htmlUrl: `https://github.com/${input.owner}/${input.repo}/tree/${input.branch}`,
    };
  }

  async deleteBranch(input: GithubDeleteBranchInput): Promise<GithubDeleteBranchOutput> {
    await this.request(
      "DELETE",
      `/repos/${input.owner}/${input.repo}/git/refs/heads/${input.branch}`,
      undefined,
      "GITHUB_DELETE_BRANCH_FAILED",
      true,
    );
    return { owner: input.owner, repo: input.repo, branch: input.branch };
  }

  async commit(input: GithubCommitInput): Promise<GithubCommitOutput> {
    const ref = await this.request<{ object: { sha: string } }>(
      "GET",
      `/repos/${input.owner}/${input.repo}/git/ref/heads/${input.branch}`,
      undefined,
      "GITHUB_COMMIT_BASE_REF_NOT_FOUND",
    );
    const parentSha = ref.object.sha;

    const baseCommit = await this.request<{ tree: { sha: string } }>(
      "GET",
      `/repos/${input.owner}/${input.repo}/git/commits/${parentSha}`,
      undefined,
      "GITHUB_COMMIT_BASE_NOT_FOUND",
    );

    const tree = await this.request<{ sha: string }>(
      "POST",
      `/repos/${input.owner}/${input.repo}/git/trees`,
      {
        base_tree: baseCommit.tree.sha,
        tree: input.files.map((file) => ({ path: file.path, mode: "100644", type: "blob", content: file.content })),
      },
      "GITHUB_CREATE_TREE_FAILED",
    );

    const commit = await this.request<{ sha: string; html_url: string }>(
      "POST",
      `/repos/${input.owner}/${input.repo}/git/commits`,
      { message: input.message, tree: tree.sha, parents: [parentSha] },
      "GITHUB_CREATE_COMMIT_FAILED",
    );

    await this.request(
      "PATCH",
      `/repos/${input.owner}/${input.repo}/git/refs/heads/${input.branch}`,
      { sha: commit.sha },
      "GITHUB_UPDATE_REF_FAILED",
    );

    return {
      owner: input.owner,
      repo: input.repo,
      branch: input.branch,
      sha: commit.sha,
      treeSha: tree.sha,
      parentSha,
      htmlUrl: `https://github.com/${input.owner}/${input.repo}/commit/${commit.sha}`,
    };
  }

  async createPullRequest(input: GithubCreatePullRequestInput): Promise<GithubCreatePullRequestOutput> {
    const data = await this.request<{ number: number; state: string; html_url: string }>(
      "POST",
      `/repos/${input.owner}/${input.repo}/pulls`,
      { title: input.title, head: input.head, base: input.base, body: input.body, draft: input.draft },
      "GITHUB_CREATE_PR_FAILED",
    );

    return { owner: input.owner, repo: input.repo, number: data.number, state: data.state, htmlUrl: data.html_url };
  }

  async closePullRequest(input: GithubClosePullRequestInput): Promise<GithubClosePullRequestOutput> {
    const data = await this.request<{ number: number; state: string }>(
      "PATCH",
      `/repos/${input.owner}/${input.repo}/pulls/${input.number}`,
      { state: "closed" },
      "GITHUB_CLOSE_PR_FAILED",
    );

    return { owner: input.owner, repo: input.repo, number: data.number, state: data.state };
  }

  async listBranches(input: GithubListBranchesInput): Promise<GithubListBranchesOutput> {
    const data = await this.request<Array<{ name: string; commit: { sha: string }; protected: boolean }>>(
      "GET",
      `/repos/${input.owner}/${input.repo}/branches?per_page=100`,
      undefined,
      "GITHUB_LIST_BRANCHES_FAILED",
    );

    const branches: GithubBranchSummary[] = data.map((branch) => ({
      name: branch.name,
      sha: branch.commit.sha,
      protected: branch.protected,
    }));

    return { owner: input.owner, repo: input.repo, branches };
  }

  async listPullRequests(input: GithubListPullRequestsInput): Promise<GithubListPullRequestsOutput> {
    const state = input.state ?? "open";
    const data = await this.request<
      Array<{ number: number; title: string; state: string; head: { ref: string }; base: { ref: string }; html_url: string }>
    >("GET", `/repos/${input.owner}/${input.repo}/pulls?state=${state}&per_page=100`, undefined, "GITHUB_LIST_PRS_FAILED");

    const pullRequests: GithubPullRequestSummary[] = data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      head: pr.head.ref,
      base: pr.base.ref,
      htmlUrl: pr.html_url,
    }));

    return { owner: input.owner, repo: input.repo, pullRequests };
  }

  async listCommits(input: GithubListCommitsInput): Promise<GithubListCommitsOutput> {
    const params = new URLSearchParams({ per_page: "100" });
    if (input.sha) params.set("sha", input.sha);
    if (input.path) params.set("path", input.path);

    const data = await this.request<
      Array<{ sha: string; commit: { message: string; author: { name: string; date: string } }; html_url: string }>
    >("GET", `/repos/${input.owner}/${input.repo}/commits?${params.toString()}`, undefined, "GITHUB_LIST_COMMITS_FAILED");

    const commits: GithubCommitSummary[] = data.map((entry) => ({
      sha: entry.sha,
      message: entry.commit.message,
      author: entry.commit.author.name,
      authoredAt: entry.commit.author.date,
      htmlUrl: entry.html_url,
    }));

    return { owner: input.owner, repo: input.repo, commits };
  }

  async compareCommits(input: GithubCompareCommitsInput): Promise<GithubCompareCommitsOutput> {
    const data = await this.request<{
      status: string;
      ahead_by: number;
      behind_by: number;
      total_commits: number;
      html_url: string;
      files?: Array<{ filename: string; status: string; additions: number; deletions: number; changes: number }>;
    }>(
      "GET",
      `/repos/${input.owner}/${input.repo}/compare/${input.base}...${input.head}`,
      undefined,
      "GITHUB_COMPARE_COMMITS_FAILED",
    );

    return {
      owner: input.owner,
      repo: input.repo,
      base: input.base,
      head: input.head,
      status: data.status,
      aheadBy: data.ahead_by,
      behindBy: data.behind_by,
      totalCommits: data.total_commits,
      files: (data.files ?? []).map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
      })),
      htmlUrl: data.html_url,
    };
  }

  async createIssue(input: GithubCreateIssueInput): Promise<GithubCreateIssueOutput> {
    const data = await this.request<{ number: number; state: string; html_url: string }>(
      "POST",
      `/repos/${input.owner}/${input.repo}/issues`,
      { title: input.title, body: input.body, labels: input.labels },
      "GITHUB_CREATE_ISSUE_FAILED",
    );

    return { owner: input.owner, repo: input.repo, number: data.number, state: data.state, htmlUrl: data.html_url };
  }

  async closeIssue(input: GithubCloseIssueInput): Promise<GithubCloseIssueOutput> {
    const data = await this.request<{ number: number; state: string }>(
      "PATCH",
      `/repos/${input.owner}/${input.repo}/issues/${input.number}`,
      { state: "closed" },
      "GITHUB_CLOSE_ISSUE_FAILED",
    );

    return { owner: input.owner, repo: input.repo, number: data.number, state: data.state };
  }

  async commentPullRequest(input: GithubCommentPullRequestInput): Promise<GithubCommentPullRequestOutput> {
    const data = await this.request<{ id: number; html_url: string }>(
      "POST",
      `/repos/${input.owner}/${input.repo}/issues/${input.number}/comments`,
      { body: input.body },
      "GITHUB_COMMENT_PR_FAILED",
    );

    return { owner: input.owner, repo: input.repo, number: input.number, commentId: data.id, htmlUrl: data.html_url };
  }

  async deleteComment(input: GithubDeleteCommentInput): Promise<GithubDeleteCommentOutput> {
    await this.request(
      "DELETE",
      `/repos/${input.owner}/${input.repo}/issues/comments/${input.commentId}`,
      undefined,
      "GITHUB_DELETE_COMMENT_FAILED",
      true,
    );
    return { owner: input.owner, repo: input.repo, commentId: input.commentId };
  }

  private async getFileContents(
    owner: string,
    repo: string,
    path: string,
    ref: string,
  ): Promise<GithubContentsFileResponse | GithubContentsFileResponse[]> {
    return this.request<GithubContentsFileResponse | GithubContentsFileResponse[]>(
      "GET",
      `/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`,
      undefined,
      "GITHUB_READ_FAILED",
    );
  }

  private async tryReadFile(owner: string, repo: string, path: string, ref: string): Promise<GithubReadFileOutput | null> {
    try {
      return await this.readFile({ owner, repo, path, ref });
    } catch {
      return null;
    }
  }

  private async request<T>(method: string, path: string, body: unknown, errorCode: string, allowEmptyResponse = false): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "luna-gateway",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const response = await fetch(new URL(`${this.baseUrl}${path}`), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new GatewayError(errorCode, `GitHub request failed with status ${response.status}`, await response.text());
    }

    if (allowEmptyResponse && response.status === 204) return undefined as T;

    return (await response.json()) as T;
  }
}
