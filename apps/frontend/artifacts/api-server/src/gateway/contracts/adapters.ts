import type { CapabilityManifest } from "./manifest";

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

export interface SupabaseQueryInput {
  table: string;
  select?: string;
  filters?: Record<string, unknown>;
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
}

export interface SupabaseQueryOutput {
  table: string;
  rows: Record<string, unknown>[];
  count: number;
}

export interface SupabaseInsertInput {
  table: string;
  records: Record<string, unknown>[];
}

export interface SupabaseInsertOutput {
  table: string;
  inserted: Record<string, unknown>[];
  count: number;
}

export interface SupabaseUpdateInput {
  table: string;
  values: Record<string, unknown>;
  filters: Record<string, unknown>;
}

export interface SupabaseUpdateOutput {
  table: string;
  updated: Record<string, unknown>[];
  count: number;
}

export interface SupabaseDeleteInput {
  table: string;
  filters: Record<string, unknown>;
}

export interface SupabaseDeleteOutput {
  table: string;
  deleted: Record<string, unknown>[];
  count: number;
}

export interface SupabaseRpcInput {
  fn: string;
  args?: Record<string, unknown>;
}

export interface SupabaseRpcOutput {
  fn: string;
  data: unknown;
}

export interface SupabaseUploadFileInput {
  bucket: string;
  path: string;
  content: string;
  contentType?: string;
  upsert?: boolean;
}

export interface SupabaseUploadFileOutput {
  bucket: string;
  path: string;
  fullPath: string;
}

export interface SupabaseDownloadFileInput {
  bucket: string;
  path: string;
}

export interface SupabaseDownloadFileOutput {
  bucket: string;
  path: string;
  content: string;
  contentType: string;
  size: number;
}

export interface SupabaseAdapter {
  query(input: SupabaseQueryInput): Promise<SupabaseQueryOutput>;
  insert(input: SupabaseInsertInput): Promise<SupabaseInsertOutput>;
  update(input: SupabaseUpdateInput): Promise<SupabaseUpdateOutput>;
  delete(input: SupabaseDeleteInput): Promise<SupabaseDeleteOutput>;
  rpc(input: SupabaseRpcInput): Promise<SupabaseRpcOutput>;
  uploadFile(input: SupabaseUploadFileInput): Promise<SupabaseUploadFileOutput>;
  downloadFile(input: SupabaseDownloadFileInput): Promise<SupabaseDownloadFileOutput>;
}

export interface RailwayDeployInput {
  serviceId: string;
  environmentId: string;
  commitSha?: string;
}

export interface RailwayDeployOutput {
  deploymentId: string;
  serviceId: string;
  environmentId: string;
  status: string;
}

export interface RailwayListServicesInput {
  projectId: string;
}

export interface RailwayServiceSummary {
  id: string;
  name: string;
  updatedAt?: string;
}

export interface RailwayListServicesOutput {
  projectId: string;
  services: RailwayServiceSummary[];
}

export interface RailwayStatusInput {
  serviceId: string;
  environmentId: string;
}

export interface RailwayStatusOutput {
  serviceId: string;
  environmentId: string;
  status: string;
  latestDeploymentId?: string;
}

export interface RailwayLogsInput {
  deploymentId: string;
  limit?: number;
}

export interface RailwayLogEntry {
  timestamp: string;
  message: string;
  severity?: string;
}

export interface RailwayLogsOutput {
  deploymentId: string;
  logs: RailwayLogEntry[];
}

export interface RailwayVariablesInput {
  serviceId: string;
  environmentId: string;
}

export interface RailwayVariablesOutput {
  serviceId: string;
  environmentId: string;
  variables: Record<string, string>;
}

export interface RailwayRestartServiceInput {
  serviceId: string;
  environmentId: string;
}

export interface RailwayRestartServiceOutput {
  serviceId: string;
  environmentId: string;
  restarted: boolean;
}

export interface RailwayAdapter {
  deploy(input: RailwayDeployInput): Promise<RailwayDeployOutput>;
  listServices(input: RailwayListServicesInput): Promise<RailwayListServicesOutput>;
  status(input: RailwayStatusInput): Promise<RailwayStatusOutput>;
  logs(input: RailwayLogsInput): Promise<RailwayLogsOutput>;
  variables(input: RailwayVariablesInput): Promise<RailwayVariablesOutput>;
  restartService(input: RailwayRestartServiceInput): Promise<RailwayRestartServiceOutput>;
}

export type ReporterAuditRepositoryInput = Record<string, never>;

export interface RepositoryApplicationEntry {
  name: string;
  type: string;
  status: string;
  role: string;
}

export interface ReporterAuditRepositoryOutput {
  generatedAt: string;
  applications: RepositoryApplicationEntry[];
  gitBranch: string;
  gitHeadSha: string;
  gitStatusClean: boolean;
}

export type ReporterSnapshotInput = Record<string, never>;

export interface ReporterSnapshotOutput {
  generatedAt: string;
  checkpointId: string;
  cognitiveIndexRef: string;
  checkpointRefs: string[];
  runtimeMemoryRef: string;
  architecturalMemoryRefs: string[];
}

export type ReporterRuntimeStateInput = Record<string, never>;

export interface ReporterRuntimeStateOutput {
  generatedAt: string;
  process: {
    uptimeSeconds: number;
    nodeVersion: string;
    memoryRssBytes: number;
    pid: number;
  };
  runtimeState: Record<string, unknown> | null;
}

export type ReporterRepositoryMapInput = Record<string, never>;

export interface ReporterRepositoryMapOutput {
  generatedAt: string;
  repositoryMap: Record<string, unknown> | null;
}

export type ReporterCapabilityInventoryInput = Record<string, never>;

export interface ReporterCapabilityInventoryOutput {
  generatedAt: string;
  capabilityCount: number;
  capabilities: CapabilityManifest[];
}

export type ReporterArchitectureReportInput = Record<string, never>;

export interface ReporterArchitectureLayer {
  name: string;
  description: string;
  locations: string[];
}

export interface ReporterArchitectureReportOutput {
  generatedAt: string;
  layers: ReporterArchitectureLayer[];
  capabilityCount: number;
  documentationRefs: string[];
}

export interface ReporterAdapter {
  auditRepository(input: ReporterAuditRepositoryInput): Promise<ReporterAuditRepositoryOutput>;
  snapshot(input: ReporterSnapshotInput): Promise<ReporterSnapshotOutput>;
  runtimeState(input: ReporterRuntimeStateInput): Promise<ReporterRuntimeStateOutput>;
  repositoryMap(input: ReporterRepositoryMapInput): Promise<ReporterRepositoryMapOutput>;
  capabilityInventory(input: ReporterCapabilityInventoryInput): Promise<ReporterCapabilityInventoryOutput>;
  architectureReport(input: ReporterArchitectureReportInput): Promise<ReporterArchitectureReportOutput>;
}
