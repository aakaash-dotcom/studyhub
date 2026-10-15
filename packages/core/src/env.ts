import { z } from "zod";

/**
 * Environment contract. Dev works with an empty .env (embedded DB, mock
 * providers); production fills these in. Nothing else in the codebase reads
 * process.env directly.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().default("http://localhost:3000"),

  DATABASE_URL: z.string().optional(),

  TOKEN_ENCRYPTION_KEY: z.string().optional(),

  ADMIN_EMAIL: z.string().default("ravi@centum.local"),
  ADMIN_PASSWORD: z.string().default("centum-admin"),
  ADMIN_NAME: z.string().default("Ravi"),

  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_GRAPH_VERSION: z.string().default("v23.0"),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_DRIVE_FOLDER_ID: z.string().optional(),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default("centum-media"),
  R2_PUBLIC_BASE_URL: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),

  WHATSAPP_CRM_BASE_URL: z.string().optional(),
  WHATSAPP_CRM_API_KEY: z.string().optional(),
  WHATSAPP_CRM_AUTH_HEADER: z.string().default("Authorization"),
  WHATSAPP_CRM_SEND_PATH: z.string().default("/messages"),
  WHATSAPP_CRM_APPROVER_NUMBER: z.string().optional(),

  PROVIDER_MODE: z.enum(["mock", "live"]).default("mock"),
  LOG_LEVEL: z.string().default("info"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function isProd(): boolean {
  return env().NODE_ENV === "production";
}

export function isMock(): boolean {
  return env().PROVIDER_MODE === "mock";
}

/** True when the credentials for a platform have actually been supplied. */
export function hasMetaCredentials(): boolean {
  const e = env();
  return Boolean(e.META_APP_ID && e.META_APP_SECRET);
}
export function hasGoogleCredentials(): boolean {
  const e = env();
  return Boolean(e.GOOGLE_CLIENT_ID && e.GOOGLE_CLIENT_SECRET);
}
export function hasR2Credentials(): boolean {
  const e = env();
  return Boolean(e.R2_ACCESS_KEY_ID && e.R2_SECRET_ACCESS_KEY && e.R2_PUBLIC_BASE_URL);
}
export function hasWhatsAppCredentials(): boolean {
  const e = env();
  return Boolean(e.WHATSAPP_CRM_BASE_URL && e.WHATSAPP_CRM_API_KEY);
}
