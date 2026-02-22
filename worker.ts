export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return env.ASSETS.fetch(request);
  },
};

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  ADMIN_PASSWORD: string;
}
