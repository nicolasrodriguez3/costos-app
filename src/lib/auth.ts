import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, organization } from "better-auth/plugins";

import { getActiveOrganization } from "@/actions/organization";
import { AUTH_CONFIG } from "@/config/auth.config";
import { clientEnv, serverEnv } from "@/config/env";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const env = serverEnv();

export const auth = betterAuth({
  logger: {
    disabled: env.NODE_ENV === "production",
    level: "debug",
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  appName: clientEnv.NEXT_PUBLIC_APP_TITLE,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    minPasswordLength: AUTH_CONFIG.MIN_PASSWORD_LENGTH,
    maxPasswordLength: AUTH_CONFIG.MAX_PASSWORD_LENGTH,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail({
        to: user.email,
        url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationEmail({
        to: user.email,
        url,
      });
    },
  },
  baseURL: env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
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
    admin({
      defaultRole: "USER",
    }),
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
