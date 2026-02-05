import { createAuthClient } from "better-auth/react";

import { envs } from "@/config/envs";

const authClient = createAuthClient({
  baseURL: envs.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signOut, signUp, useSession } = authClient;
