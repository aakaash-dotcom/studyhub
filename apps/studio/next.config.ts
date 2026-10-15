import type { NextConfig } from "next";

const config: NextConfig = {
  // Workspace packages ship TypeScript source; Next compiles them directly.
  transpilePackages: ["@centum/core", "@centum/providers", "@centum/media", "@centum/notify"],
  // Native/wasm modules must not be bundled by the server compiler.
  serverExternalPackages: ["@electric-sql/pglite", "postgres", "pino", "pino-pretty", "aws4fetch"],
  typescript: { ignoreBuildErrors: false },
  // The preview (and any tunnelled dev origin) must be allowed to load dev
  // resources, otherwise the browser blocks /_next/* and the app half-works:
  // forms submit but client-side navigation and HMR never arrive.
  allowedDevOrigins: [
    "*.e2b.app",
    ...(process.env.PREVIEW_ALLOWED_ORIGINS?.split(/[\s,]+/).filter(Boolean) ?? []),
  ],
  experimental: {
    // The hosted preview serves this app from a *.e2b.app proxy host. Next's
    // built-in Server Action origin check compares the Origin header with the
    // dev server host, so without this every form submit (login, compose,
    // approve) would be rejected in the preview. Extra hosts can be appended
    // with PREVIEW_ALLOWED_ORIGINS, space-separated.
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.e2b.app",
        ...(process.env.PREVIEW_ALLOWED_ORIGINS?.split(/[\s,]+/).filter(Boolean) ?? []),
      ],
    },
  },
};

export default config;
