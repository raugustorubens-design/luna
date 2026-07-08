import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  FilesystemAdapter,
  FilesystemDeleteInput,
  FilesystemDeleteOutput,
  FilesystemDiffInput,
  FilesystemDiffOutput,
  FilesystemEntry,
  FilesystemExistsInput,
  FilesystemExistsOutput,
  FilesystemListInput,
  FilesystemListOutput,
  FilesystemReadInput,
  FilesystemReadOutput,
  FilesystemSearchInput,
  FilesystemSearchMatch,
  FilesystemSearchOutput,
  FilesystemWriteInput,
  FilesystemWriteOutput,
} from "../contracts";
import { GatewayError } from "../errors/gateway-error";

export class FilesystemRestAdapter implements FilesystemAdapter {
  constructor(private readonly rootDir: string = process.env.LUNA_FILESYSTEM_ROOT ?? process.cwd()) {}

  async read(input: FilesystemReadInput): Promise<FilesystemReadOutput> {
    const resolved = this.resolve(input.path);
    const encoding = input.encoding ?? "utf8";

    try {
      const buffer = await fs.readFile(resolved);
      const content = encoding === "base64" ? buffer.toString("base64") : buffer.toString("utf8");
      return { path: input.path, content, encoding, size: buffer.byteLength };
    } catch (error) {
      throw new GatewayError("FILESYSTEM_READ_FAILED", `Failed to read ${input.path}`, this.describe(error));
    }
  }

  async write(input: FilesystemWriteInput): Promise<FilesystemWriteOutput> {
    const resolved = this.resolve(input.path);
    const encoding = input.encoding ?? "utf8";
    const previousContent = await this.tryReadUtf8(resolved);
    const created = previousContent === null;

    try {
      await fs.mkdir(path.dirname(resolved), { recursive: true });
      const buffer = Buffer.from(input.content, encoding === "base64" ? "base64" : "utf8");
      await fs.writeFile(resolved, buffer);
      return { path: input.path, size: buffer.byteLength, created, previousContent };
    } catch (error) {
      throw new GatewayError("FILESYSTEM_WRITE_FAILED", `Failed to write ${input.path}`, this.describe(error));
    }
  }

  async delete(input: FilesystemDeleteInput): Promise<FilesystemDeleteOutput> {
    const resolved = this.resolve(input.path);
    try {
      await fs.rm(resolved, { force: true });
      return { path: input.path };
    } catch (error) {
      throw new GatewayError("FILESYSTEM_DELETE_FAILED", `Failed to delete ${input.path}`, this.describe(error));
    }
  }

  async list(input: FilesystemListInput): Promise<FilesystemListOutput> {
    const resolved = this.resolve(input.path);

    try {
      const dirents = await fs.readdir(resolved, { withFileTypes: true });
      const entries: FilesystemEntry[] = await Promise.all(
        dirents.map(async (dirent) => {
          const entryPath = path.posix.join(input.path, dirent.name);
          const stat = await fs.stat(path.join(resolved, dirent.name));
          return { name: dirent.name, path: entryPath, type: dirent.isDirectory() ? "directory" : "file", size: stat.size };
        }),
      );
      return { path: input.path, entries };
    } catch (error) {
      throw new GatewayError("FILESYSTEM_LIST_FAILED", `Failed to list ${input.path}`, this.describe(error));
    }
  }

  async search(input: FilesystemSearchInput): Promise<FilesystemSearchOutput> {
    const resolved = this.resolve(input.path);
    const regex = new RegExp(input.pattern);
    const matches: FilesystemSearchMatch[] = [];

    try {
      await this.walk(resolved, input.path, async (entryPath, absolutePath) => {
        const content = await this.tryReadUtf8(absolutePath);
        if (content === null) return;

        content.split("\n").forEach((line, index) => {
          if (regex.test(line)) matches.push({ file: entryPath, line: index + 1, text: line });
        });
      });

      return { path: input.path, pattern: input.pattern, matches };
    } catch (error) {
      throw new GatewayError("FILESYSTEM_SEARCH_FAILED", `Failed to search ${input.path}`, this.describe(error));
    }
  }

  async diff(input: FilesystemDiffInput): Promise<FilesystemDiffOutput> {
    const basePath = this.resolve(input.basePath);
    const comparePath = this.resolve(input.comparePath);

    try {
      const [baseContent, compareContent] = await Promise.all([this.tryReadUtf8(basePath), this.tryReadUtf8(comparePath)]);

      const diff = buildUnifiedDiff(input.basePath, input.comparePath, baseContent ?? "", compareContent ?? "");
      return { basePath: input.basePath, comparePath: input.comparePath, identical: baseContent === compareContent, diff };
    } catch (error) {
      throw new GatewayError("FILESYSTEM_DIFF_FAILED", `Failed to diff ${input.basePath} and ${input.comparePath}`, this.describe(error));
    }
  }

  async exists(input: FilesystemExistsInput): Promise<FilesystemExistsOutput> {
    const resolved = this.resolve(input.path);

    try {
      const stat = await fs.stat(resolved);
      return { path: input.path, exists: true, type: stat.isDirectory() ? "directory" : "file" };
    } catch {
      return { path: input.path, exists: false, type: null };
    }
  }

  private resolve(relativePath: string): string {
    const resolved = path.resolve(this.rootDir, relativePath);
    if (resolved !== this.rootDir && !resolved.startsWith(this.rootDir + path.sep)) {
      throw new GatewayError("FILESYSTEM_PATH_OUTSIDE_ROOT", "Path escapes the filesystem adapter root", { path: relativePath });
    }
    return resolved;
  }

  private async tryReadUtf8(absolutePath: string): Promise<string | null> {
    try {
      return await fs.readFile(absolutePath, "utf8");
    } catch {
      return null;
    }
  }

  private async walk(absoluteDir: string, relativeDir: string, onFile: (relativePath: string, absolutePath: string) => Promise<void>): Promise<void> {
    const dirents = await fs.readdir(absoluteDir, { withFileTypes: true });

    for (const dirent of dirents) {
      const absoluteEntry = path.join(absoluteDir, dirent.name);
      const relativeEntry = path.posix.join(relativeDir, dirent.name);

      if (dirent.isDirectory()) {
        await this.walk(absoluteEntry, relativeEntry, onFile);
      } else if (dirent.isFile()) {
        await onFile(relativeEntry, absoluteEntry);
      }
    }
  }

  private describe(error: unknown): unknown {
    return error instanceof Error ? { message: error.message } : error;
  }
}

function buildUnifiedDiff(baseLabel: string, compareLabel: string, base: string, compare: string): string {
  const baseLines = base.length ? base.split("\n") : [];
  const compareLines = compare.length ? compare.split("\n") : [];

  const lcs = longestCommonSubsequence(baseLines, compareLines);
  const lines: string[] = [`--- ${baseLabel}`, `+++ ${compareLabel}`];

  let i = 0;
  let j = 0;
  for (const [a, b] of lcs) {
    while (i < a) lines.push(`-${baseLines[i++]}`);
    while (j < b) lines.push(`+${compareLines[j++]}`);
    lines.push(` ${baseLines[i]}`);
    i++;
    j++;
  }
  while (i < baseLines.length) lines.push(`-${baseLines[i++]}`);
  while (j < compareLines.length) lines.push(`+${compareLines[j++]}`);

  return lines.join("\n");
}

function longestCommonSubsequence(a: string[], b: string[]): Array<[number, number]> {
  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i]![j] = a[i] === b[j] ? table[i + 1]![j + 1]! + 1 : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
    }
  }

  const pairs: Array<[number, number]> = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      i++;
    } else {
      j++;
    }
  }

  return pairs;
}
