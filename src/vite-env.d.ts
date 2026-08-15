/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DATA_SOURCE?: 'api' | 'local';
  readonly VITE_DEMO_MODE?: 'true' | 'false';
  readonly VITE_DEMO_EMAIL?: string;
  readonly VITE_DEMO_ACCESS_CODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
