import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";

import { AUTH_CONFIG } from "@/config/auth.config";
import { envs } from "@/config/envs";
import { prisma } from "@/lib/prisma";

export const authConfig = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  appName: envs.NEXT_PUBLIC_APP_TITLE,
  user: {
    additionalFields: {
      organizationId: {
        type: "string",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
    minPasswordLength: AUTH_CONFIG.MIN_PASSWORD_LENGTH,
    maxPasswordLength: AUTH_CONFIG.MAX_PASSWORD_LENGTH,
  },
  baseURL: envs.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: envs.GOOGLE_CLIENT_ID,
      clientSecret: envs.GOOGLE_CLIENT_SECRET,
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-in-social")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          // TODO: Avisarme que alguien se registro, enviar un correo, etc
          console.log("user registered", newSession.user.name);
        }
      }
    }),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [nextCookies()], // nextCookies debe ser el último plugin
});

export type Session = typeof authConfig.$Infer.Session;
