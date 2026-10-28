/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Django API, e.g. http://localhost:8000/api (no trailing slash). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
