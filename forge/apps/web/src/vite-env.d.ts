/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LUNA_API_BASE_URL?: string;
  readonly VITE_FORGE_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
