/**
 * Guardian MVP-01 — contrato público de armazenamento (mesmo formato do
 * repositório oficial `raugustorubens-design/luna-api`, `src/guardian/
 * contracts.js`). O Memory Engine depende só disto — nunca de um driver de
 * banco diretamente. Guardian nunca decide, nunca infere, nunca consolida,
 * nunca reconstrói contexto; executa exclusivamente operações físicas de
 * armazenamento e registra auditoria (origem, operação, horário, destino).
 */

export interface StorageSaveInput {
  collection: string;
  data: Record<string, unknown>;
}

export interface StorageUpdateInput {
  collection: string;
  id: string | number;
  data: Record<string, unknown>;
}

export interface StorageDeleteInput {
  collection: string;
  id: string | number;
}

export interface StorageGetInput {
  collection: string;
  id: string | number;
}

export interface StorageSearchInput {
  collection: string;
  filter?: Record<string, unknown>;
  limit?: number;
  orderBy?: string;
  ascending?: boolean;
}

export type StorageRecord = Record<string, unknown>;

export interface GuardianContract {
  save(input: StorageSaveInput, origin: string): Promise<StorageRecord | null>;
  update(input: StorageUpdateInput, origin: string): Promise<StorageRecord | null>;
  delete(input: StorageDeleteInput, origin: string): Promise<boolean>;
  get(input: StorageGetInput, origin: string): Promise<StorageRecord | null>;
  search(input: StorageSearchInput, origin: string): Promise<StorageRecord[]>;
}
