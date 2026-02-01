import "dotenv/config";

import { z } from "zod";

/*
# Database
DATABASE_URL="postgresql://costos_user:costos_pass@localhost:5432/costos"
POSTGRES_DB="costos"
POSTGRES_USER="costos_user"
POSTGRES_PASSWORD="costos_pass"

# BetterAuth
BETTER_AUTH_SECRET="UKr0rlNXT3DKeyrHEkIdSvQwthlT48LKQmXWhuLtTK0="
BETTER_AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
*/

const nodeEnvSchema = z.enum(["development", "test", "production"]);
const baseEnvSchema = {
  NODE_ENV: nodeEnvSchema,
  PORT: z.coerce.number().int().positive(),
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_APP_TITLE: z.string().min(1),

  DATABASE_URL: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),

  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
};
const devEnvSchema = z.object({
  ...baseEnvSchema,
  NODE_ENV: z.literal("development"),
});

const testEnvSchema = z.object({
  ...baseEnvSchema,
  NODE_ENV: z.literal("test"),
});

const prodEnvSchema = z.object({
  ...baseEnvSchema,
  NODE_ENV: z.literal("production"),
});
const envSchema = z.discriminatedUnion("NODE_ENV", [
  devEnvSchema,
  testEnvSchema,
  prodEnvSchema,
]);

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // console.error(z.treeifyError(parsedEnv.error));
  console.error(parsedEnv.error.issues);

  throw new Error("Invalid environment variables");
}

export const envs = parsedEnv.data;
