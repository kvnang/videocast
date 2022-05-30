export interface Env {
  R2: R2Bucket;
  KV: KVNamespace;
  CF_AUTH_SECRET: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  GOOGLE_FONTS_API_KEY: string;
}

export interface FontProps {
  family: string;
  files: Record<string, string>;
}
