import "dotenv/config";

import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_APP_TITLE: z.string().min(1),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().optional(),
  NEXT_PUBLIC_APP_LAUNCHED: z.string().transform((val) => val === "true"),
});

const serverEnvSchema = z.object({
  PORT: z.coerce.number().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),

  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(1),
});

const allEnvSchema = publicEnvSchema.extend(serverEnvSchema.shape);

// Infer the full type (Server + Client)
type ServerEnv = z.infer<typeof allEnvSchema>;

// Cache envs
let _envs: ServerEnv | null = null;

const loadEnvs = (): ServerEnv => {
  const isServer = typeof window === "undefined";

  if (isServer) {
    // Server: Validate everything
    const parsed = allEnvSchema.safeParse(process.env);

    if (!parsed.success) {
      console.error(
        "❌ Invalid server environment variables:",
        z.treeifyError(parsed.error),
      );
      throw new Error("Invalid environment variables");
    }
    return parsed.data;
  } else {
    // Client: Validate public only
    const clientEnv = {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE,
      NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
      NEXT_PUBLIC_APP_LAUNCHED: process.env.NEXT_PUBLIC_APP_LAUNCHED,
    };

    const parsed = publicEnvSchema.safeParse(clientEnv);

    if (!parsed.success) {
      console.error(
        "❌ Invalid client environment variables:",
        z.treeifyError(parsed.error),
      );
      throw new Error("Invalid environment variables");
    }

    // Cast to ServerEnv (the full type) for consistent types across the app.
    // In the browser, only public keys will be available at runtime.
    return parsed.data as ServerEnv;
  }
};

export const envs = (): ServerEnv => {
  if (!_envs) {
    _envs = loadEnvs();
  }
  return _envs;
};
