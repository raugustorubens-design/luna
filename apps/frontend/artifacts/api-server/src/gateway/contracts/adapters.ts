export interface GithubReadFileInput {
  owner: string;
  repo: string;
  path: string;
  ref?: string;
}

export interface GithubReadFileOutput {
  owner: string;
  repo: string;
  path: string;
  ref: string;
  sha: string;
  encoding: string;
  content: string;
  size: number;
  htmlUrl: string;
}

export interface GithubWriteFileInput {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch?: string;
  sha?: string;
}

export interface GithubWriteFileOutput {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  sha: string;
  previousSha: string | null;
  previousContent: string | null;
  commitSha: string;
  htmlUrl: string;
}

export interface GithubDeleteFileInput {
  owner: string;
  repo: string;
  path: string;
  message: string;
  sha: string;
  branch?: string;
}

export interface GithubDeleteFileOutput {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  commitSha: string;
}

export interface GithubCreateBranchInput {
  owner: string;
  repo: string;
  branch: string;
  fromRef?: string;
}

export interface GithubCreateBranchOutput {
  owner: string;
  repo: string;
  branch: string;
  ref: string;
  sha: string;
  htmlUrl: string;
}

export interface GithubDeleteBranchInput {
  owner: string;
  repo: string;
  branch: string;
}

export interface GithubDeleteBranchOutput {
  owner: string;
  repo: string;
  branch: string;
}

export interface GithubCommitFileChange {
  path: string;
  content: string;
}

export interface GithubCommitInput {
  owner: string;
  repo: string;
  branch: string;
  message: string;
  files: GithubCommitFileChange[];
}

export interface GithubCommitOutput {
  owner: string;
  repo: string;
  branch: string;
  sha: string;
  treeSha: string;
  parentSha: string;
  htmlUrl: string;
}

export interface GithubCreatePullRequestInput {
  owner: string;
  repo: string;
  title: string;
  head: string;
  base: string;
  body?: string;
  draft?: boolean;
}

export interface GithubCreatePullRequestOutput {
  owner: string;
  repo: string;
  number: number;
  state: string;
  htmlUrl: string;
}

export interface GithubClosePullRequestInput {
  owner: string;
  repo: string;
  number: number;
}

export interface GithubClosePullRequestOutput {
  owner: string;
  repo: string;
  number: number;
  state: string;
}

export interface GithubListBranchesInput {
  owner: string;
  repo: string;
}

export interface GithubBranchSummary {
  name: string;
  sha: string;
  protected: boolean;
}

export interface GithubListBranchesOutput {
  owner: string;
  repo: string;
  branches: GithubBranchSummary[];
}

export interface GithubListPullRequestsInput {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
}

export interface GithubPullRequestSummary {
  number: number;
  title: string;
  state: string;
  head: string;
  base: string;
  htmlUrl: string;
}

export interface GithubListPullRequestsOutput {
  owner: string;
  repo: string;
  pullRequests: GithubPullRequestSummary[];
}

export interface GithubListCommitsInput {
  owner: string;
  repo: string;
  sha?: string;
  path?: string;
}

export interface GithubCommitSummary {
  sha: string;
  message: string;
  author: string;
  authoredAt: string;
  htmlUrl: string;
}

export interface GithubListCommitsOutput {
  owner: string;
  repo: string;
  commits: GithubCommitSummary[];
}

export interface GithubCompareCommitsInput {
  owner: string;
  repo: string;
  base: string;
  head: string;
}

export interface GithubCompareCommitsFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
}

export interface GithubCompareCommitsOutput {
  owner: string;
  repo: string;
  base: string;
  head: string;
  status: string;
  aheadBy: number;
  behindBy: number;
  totalCommits: number;
  files: GithubCompareCommitsFile[];
  htmlUrl: string;
}

export interface GithubCreateIssueInput {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  labels?: string[];
}

export interface GithubCreateIssueOutput {
  owner: string;
  repo: string;
  number: number;
  state: string;
  htmlUrl: string;
}

export interface GithubCloseIssueInput {
  owner: string;
  repo: string;
  number: number;
}

export interface GithubCloseIssueOutput {
  owner: string;
  repo: string;
  number: number;
  state: string;
}

export interface GithubCommentPullRequestInput {
  owner: string;
  repo: string;
  number: number;
  body: string;
}

export interface GithubCommentPullRequestOutput {
  owner: string;
  repo: string;
  number: number;
  commentId: number;
  htmlUrl: string;
}

export interface GithubDeleteCommentInput {
  owner: string;
  repo: string;
  commentId: number;
}

export interface GithubDeleteCommentOutput {
  owner: string;
  repo: string;
  commentId: number;
}

export interface GithubAdapter {
  readFile(input: GithubReadFileInput): Promise<GithubReadFileOutput>;
  writeFile(input: GithubWriteFileInput): Promise<GithubWriteFileOutput>;
  deleteFile(input: GithubDeleteFileInput): Promise<GithubDeleteFileOutput>;
  createBranch(input: GithubCreateBranchInput): Promise<GithubCreateBranchOutput>;
  deleteBranch(input: GithubDeleteBranchInput): Promise<GithubDeleteBranchOutput>;
  commit(input: GithubCommitInput): Promise<GithubCommitOutput>;
  createPullRequest(input: GithubCreatePullRequestInput): Promise<GithubCreatePullRequestOutput>;
  closePullRequest(input: GithubClosePullRequestInput): Promise<GithubClosePullRequestOutput>;
  listBranches(input: GithubListBranchesInput): Promise<GithubListBranchesOutput>;
  listPullRequests(input: GithubListPullRequestsInput): Promise<GithubListPullRequestsOutput>;
  listCommits(input: GithubListCommitsInput): Promise<GithubListCommitsOutput>;
  compareCommits(input: GithubCompareCommitsInput): Promise<GithubCompareCommitsOutput>;
  createIssue(input: GithubCreateIssueInput): Promise<GithubCreateIssueOutput>;
  closeIssue(input: GithubCloseIssueInput): Promise<GithubCloseIssueOutput>;
  commentPullRequest(input: GithubCommentPullRequestInput): Promise<GithubCommentPullRequestOutput>;
  deleteComment(input: GithubDeleteCommentInput): Promise<GithubDeleteCommentOutput>;
}
