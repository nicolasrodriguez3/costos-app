import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";

import { getActiveOrganization } from "@/actions/organization";
import { AUTH_CONFIG } from "@/config/auth.config";
import { envs } from "@/config/envs";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  logger: {
    disabled: envs.NODE_ENV === "production",
    level: "debug",
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  appName: envs.NEXT_PUBLIC_APP_TITLE,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
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
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Implement your custom logic to set initial active organization
          const organization = await getActiveOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id,
            },
          };
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [
    organization({
      organizationHooks: {
        afterCreateOrganization: async (_data) => {
          // Organization created successfully
        },
      },
    }),
    nextCookies(), // nextCookies debe ser el último plugin
  ],
});

export type Session = typeof auth.$Infer.Session;
// export default auth;
