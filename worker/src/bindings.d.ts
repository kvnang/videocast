export {};

declare global {
  const MY_BUCKET: R2Bucket;
  const CF_AUTH_SECRET: string;
  const RENDER_KV: KVNamespace;
}
