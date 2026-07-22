import assert from "node:assert/strict";
import test from "node:test";
import { SupabaseDeleteCapability } from "../capabilities/supabase/delete";
import { SupabaseDownloadFileCapability } from "../capabilities/supabase/download-file";
import { SupabaseInsertCapability } from "../capabilities/supabase/insert";
import { SupabaseQueryCapability } from "../capabilities/supabase/query";
import { SupabaseRpcCapability } from "../capabilities/supabase/rpc";
import { SupabaseUpdateCapability } from "../capabilities/supabase/update";
import { SupabaseUploadFileCapability } from "../capabilities/supabase/upload-file";
import type {
  SupabaseAdapter,
  SupabaseDeleteInput,
  SupabaseDeleteOutput,
  SupabaseDownloadFileInput,
  SupabaseDownloadFileOutput,
  SupabaseInsertInput,
  SupabaseInsertOutput,
  SupabaseQueryInput,
  SupabaseQueryOutput,
  SupabaseRpcInput,
  SupabaseRpcOutput,
  SupabaseUpdateInput,
  SupabaseUpdateOutput,
  SupabaseUploadFileInput,
  SupabaseUploadFileOutput,
} from "../contracts";
import { CapabilityRegistry } from "../registry/capability-registry";

class StubSupabaseAdapter implements SupabaseAdapter {
  async query(input: SupabaseQueryInput): Promise<SupabaseQueryOutput> {
    return { table: input.table, rows: [{ id: 1 }], count: 1 };
  }

  async insert(input: SupabaseInsertInput): Promise<SupabaseInsertOutput> {
    return { table: input.table, inserted: input.records, count: input.records.length };
  }

  async update(input: SupabaseUpdateInput): Promise<SupabaseUpdateOutput> {
    return { table: input.table, updated: [{ ...input.values, id: 1 }], count: 1 };
  }

  async delete(input: SupabaseDeleteInput): Promise<SupabaseDeleteOutput> {
    return { table: input.table, deleted: [{ id: 1 }], count: 1 };
  }

  async rpc(input: SupabaseRpcInput): Promise<SupabaseRpcOutput> {
    return { fn: input.fn, data: { ok: true } };
  }

  async uploadFile(input: SupabaseUploadFileInput): Promise<SupabaseUploadFileOutput> {
    return { bucket: input.bucket, path: input.path, fullPath: `${input.bucket}/${input.path}` };
  }

  async downloadFile(input: SupabaseDownloadFileInput): Promise<SupabaseDownloadFileOutput> {
    return { bucket: input.bucket, path: input.path, content: "aGVsbG8=", contentType: "text/plain", size: 5 };
  }
}

test("supabase.query does not require approval and returns rows", async () => {
  const registry = new CapabilityRegistry();
  registry.register(new SupabaseQueryCapability(new StubSupabaseAdapter()));

  const result = await registry.execute({ capability: "supabase.query", input: { table: "memoria_luna" } });

  assert.equal(result.success, true);
  assert.equal((result.output as SupabaseQueryOutput).rows.length, 1);
  assert.equal(result.evidence.length, 1);
});

test("supabase.insert requires approval before executing", async () => {
  const registry = new CapabilityRegistry();
  registry.register(new SupabaseInsertCapability(new StubSupabaseAdapter()));

  const denied = await registry.execute({
    capability: "supabase.insert",
    input: { table: "memoria_luna", records: [{ titulo: "x" }] },
  });

  assert.equal(denied.success, false);
  assert.equal(denied.error?.code, "APPROVAL_REQUIRED");
  assert.equal(denied.output, null);

  const approved = await registry.execute({
    capability: "supabase.insert",
    input: { table: "memoria_luna", records: [{ titulo: "x" }] },
    context: { metadata: { approval: true } },
  });

  assert.equal(approved.success, true);
  assert.equal((approved.output as SupabaseInsertOutput).count, 1);
});

test("supabase.update and supabase.delete require approval", async () => {
  const registry = new CapabilityRegistry();
  registry.register(new SupabaseUpdateCapability(new StubSupabaseAdapter()));
  registry.register(new SupabaseDeleteCapability(new StubSupabaseAdapter()));

  const updateDenied = await registry.execute({
    capability: "supabase.update",
    input: { table: "memoria_luna", values: { titulo: "y" }, filters: { id: 1 } },
  });
  assert.equal(updateDenied.error?.code, "APPROVAL_REQUIRED");

  const deleteDenied = await registry.execute({
    capability: "supabase.delete",
    input: { table: "memoria_luna", filters: { id: 1 } },
  });
  assert.equal(deleteDenied.error?.code, "APPROVAL_REQUIRED");
});

test("supabase.rpc requires approval, supabase.download_file does not", async () => {
  const registry = new CapabilityRegistry();
  registry.register(new SupabaseRpcCapability(new StubSupabaseAdapter()));
  registry.register(new SupabaseDownloadFileCapability(new StubSupabaseAdapter()));

  const rpcDenied = await registry.execute({ capability: "supabase.rpc", input: { fn: "do_thing" } });
  assert.equal(rpcDenied.error?.code, "APPROVAL_REQUIRED");

  const download = await registry.execute({
    capability: "supabase.download_file",
    input: { bucket: "assets", path: "file.txt" },
  });
  assert.equal(download.success, true);
  assert.equal((download.output as SupabaseDownloadFileOutput).size, 5);
});

test("supabase.upload_file dry-run does not invoke the adapter", async () => {
  const registry = new CapabilityRegistry();
  registry.register(new SupabaseUploadFileCapability(new StubSupabaseAdapter()));

  const result = await registry.execute({
    capability: "supabase.upload_file",
    dryRun: true,
    input: { bucket: "assets", path: "file.txt", content: "aGVsbG8=" },
  });

  assert.equal(result.success, true);
  assert.equal(result.dryRun, true);
  assert.equal(result.output, null);
});
