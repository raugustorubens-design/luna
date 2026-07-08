import type { GithubAdapter, GithubReadFileInput, GithubReadFileOutput } from "../contracts";
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
  constructor(private readonly token = process.env.GITHUB_TOKEN) {}

  async readFile(input: GithubReadFileInput): Promise<GithubReadFileOutput> {
    const ref = input.ref ?? "main";
    const url = new URL(`https://api.github.com/repos/${input.owner}/${input.repo}/contents/${input.path}`);
    url.searchParams.set("ref", ref);

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "luna-gateway",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new GatewayError("GITHUB_READ_FAILED", `GitHub read failed with status ${response.status}`, await response.text());
    }

    const data = (await response.json()) as GithubContentsFileResponse | GithubContentsFileResponse[];

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
}
