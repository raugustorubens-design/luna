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

export interface GithubAdapter {
  readFile(input: GithubReadFileInput): Promise<GithubReadFileOutput>;
}
