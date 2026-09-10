declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    BUCKET?: R2Bucket;
    EDITOR_ACCOUNT_USER_IDS?: string;
  }
}
