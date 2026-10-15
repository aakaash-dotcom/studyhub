/** `npm run db:seed` — creates the admin user and the two seed brands. */
import { getRuntime, seed } from "@centum/core";

await seed();
const runtime = await getRuntime();
await runtime.close();
