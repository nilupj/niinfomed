import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export const runtime = "edge";
export default defineCloudflareConfig({
  incrementalCache: true, // Uses the R2 bucket defined in wrangler
});