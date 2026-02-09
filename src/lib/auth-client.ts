import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { envs } from "@/config/envs";

export const authClient = createAuthClient({
  baseURL: envs.NEXT_PUBLIC_APP_URL,
  plugins: [organizationClient()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  organization,
  useActiveOrganization,
} = authClient;
