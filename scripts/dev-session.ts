/**
 * `npm run session:dev` — prints a login cookie value for local testing/curl.
 * Development only: in production you sign in through the UI.
 */
import { authenticate, createSession, env, getRuntime } from "@centum/core";

const user = await authenticate(env().ADMIN_EMAIL, env().ADMIN_PASSWORD);
if (!user) {
  console.error("Admin user not found — run `npm run db:seed` first.");
  process.exit(1);
}
const { token } = await createSession(user.id, "cli/dev-session");
console.log(`TOKEN=${token}`);
await (await getRuntime()).close();
