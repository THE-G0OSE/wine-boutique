/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_MOCKS?: "true" | "false";
  readonly VITE_MONITORING_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
