/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
