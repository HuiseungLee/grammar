declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    BUCKET?: R2Bucket;
    EDITOR_ACCOUNT_USER_IDS?: string;
    GRAMMAR_ADMIN_PASSWORD?: string;
    GRAMMAR_SESSION_SECRET?: string;
  }
}
