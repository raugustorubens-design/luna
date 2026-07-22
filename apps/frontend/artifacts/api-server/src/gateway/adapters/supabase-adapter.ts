import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { GatewayError } from "../errors/gateway-error";
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

function applyFilters<T>(builder: T, filters?: Record<string, unknown>): T {
  if (!filters) return builder;
  return Object.entries(filters).reduce(
    (acc, [column, value]) => (acc as unknown as { eq: (c: string, v: unknown) => T }).eq(column, value),
    builder,
  );
}

export class SupabaseRestAdapter implements SupabaseAdapter {
  constructor(private readonly client: SupabaseClient = supabase) {}

  async query(input: SupabaseQueryInput): Promise<SupabaseQueryOutput> {
    let builder = this.client.from(input.table).select(input.select ?? "*", { count: "exact" });
    builder = applyFilters(builder, input.filters);
    if (input.orderBy) builder = builder.order(input.orderBy.column, { ascending: input.orderBy.ascending ?? true });
    if (input.limit) builder = builder.limit(input.limit);

    const { data, error, count } = await builder;
    if (error) throw new GatewayError("SUPABASE_QUERY_FAILED", error.message, error);

    const rows = (data ?? []) as unknown as Record<string, unknown>[];
    return { table: input.table, rows, count: count ?? rows.length };
  }

  async insert(input: SupabaseInsertInput): Promise<SupabaseInsertOutput> {
    const { data, error } = await this.client.from(input.table).insert(input.records).select();
    if (error) throw new GatewayError("SUPABASE_INSERT_FAILED", error.message, error);

    const inserted = (data ?? []) as Record<string, unknown>[];
    return { table: input.table, inserted, count: inserted.length };
  }

  async update(input: SupabaseUpdateInput): Promise<SupabaseUpdateOutput> {
    let builder = this.client.from(input.table).update(input.values);
    builder = applyFilters(builder, input.filters);
    const { data, error } = await builder.select();
    if (error) throw new GatewayError("SUPABASE_UPDATE_FAILED", error.message, error);

    const updated = (data ?? []) as Record<string, unknown>[];
    return { table: input.table, updated, count: updated.length };
  }

  async delete(input: SupabaseDeleteInput): Promise<SupabaseDeleteOutput> {
    let builder = this.client.from(input.table).delete();
    builder = applyFilters(builder, input.filters);
    const { data, error } = await builder.select();
    if (error) throw new GatewayError("SUPABASE_DELETE_FAILED", error.message, error);

    const deleted = (data ?? []) as Record<string, unknown>[];
    return { table: input.table, deleted, count: deleted.length };
  }

  async rpc(input: SupabaseRpcInput): Promise<SupabaseRpcOutput> {
    const { data, error } = await this.client.rpc(input.fn, input.args ?? {});
    if (error) throw new GatewayError("SUPABASE_RPC_FAILED", error.message, error);

    return { fn: input.fn, data };
  }

  async uploadFile(input: SupabaseUploadFileInput): Promise<SupabaseUploadFileOutput> {
    const buffer = Buffer.from(input.content, "base64");
    const { data, error } = await this.client.storage.from(input.bucket).upload(input.path, buffer, {
      contentType: input.contentType,
      upsert: input.upsert ?? false,
    });
    if (error) throw new GatewayError("SUPABASE_UPLOAD_FAILED", error.message, error);

    return { bucket: input.bucket, path: input.path, fullPath: data?.path ?? input.path };
  }

  async downloadFile(input: SupabaseDownloadFileInput): Promise<SupabaseDownloadFileOutput> {
    const { data, error } = await this.client.storage.from(input.bucket).download(input.path);
    if (error) throw new GatewayError("SUPABASE_DOWNLOAD_FAILED", error.message, error);

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      bucket: input.bucket,
      path: input.path,
      content: buffer.toString("base64"),
      contentType: data.type || "application/octet-stream",
      size: buffer.byteLength,
    };
  }
}
