import { headers } from "next/headers";

import { auth } from "./auth";

export const getServerSession = async () => {
  const fullSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!fullSession) {
    throw new Error("Unauthorized");
  }

  const { session, user } = fullSession;

  return { session, user };
};
