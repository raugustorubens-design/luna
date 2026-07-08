export interface FilesystemReadInput {
  path: string;
  encoding?: "utf8" | "base64";
}

export interface FilesystemReadOutput {
  path: string;
  content: string;
  encoding: string;
  size: number;
}

export interface FilesystemWriteInput {
  path: string;
  content: string;
  encoding?: "utf8" | "base64";
}

export interface FilesystemWriteOutput {
  path: string;
  size: number;
  created: boolean;
  previousContent: string | null;
}

export interface FilesystemDeleteInput {
  path: string;
}

export interface FilesystemDeleteOutput {
  path: string;
}

export interface FilesystemListInput {
  path: string;
}

export interface FilesystemEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
}

export interface FilesystemListOutput {
  path: string;
  entries: FilesystemEntry[];
}

export interface FilesystemSearchInput {
  path: string;
  pattern: string;
}

export interface FilesystemSearchMatch {
  file: string;
  line: number;
  text: string;
}

export interface FilesystemSearchOutput {
  path: string;
  pattern: string;
  matches: FilesystemSearchMatch[];
}

export interface FilesystemDiffInput {
  basePath: string;
  comparePath: string;
}

export interface FilesystemDiffOutput {
  basePath: string;
  comparePath: string;
  identical: boolean;
  diff: string;
}

export interface FilesystemExistsInput {
  path: string;
}

export interface FilesystemExistsOutput {
  path: string;
  exists: boolean;
  type: "file" | "directory" | null;
}

export interface FilesystemAdapter {
  read(input: FilesystemReadInput): Promise<FilesystemReadOutput>;
  write(input: FilesystemWriteInput): Promise<FilesystemWriteOutput>;
  delete(input: FilesystemDeleteInput): Promise<FilesystemDeleteOutput>;
  list(input: FilesystemListInput): Promise<FilesystemListOutput>;
  search(input: FilesystemSearchInput): Promise<FilesystemSearchOutput>;
  diff(input: FilesystemDiffInput): Promise<FilesystemDiffOutput>;
  exists(input: FilesystemExistsInput): Promise<FilesystemExistsOutput>;
}
