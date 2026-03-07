import { APIError } from "better-auth";
import { headers } from "next/headers";

import { auth, type Session } from "./auth";

type ServerSession = {
  session: Session["session"];
  user: Session["user"] & { role?: string | null };
  activeOrganizationId: string | null;
};

/**
 * Get the current server session.
 * @throws Error if no session exists (user not authenticated)
 */
export const getServerSession = async (): Promise<ServerSession | null> => {
  try {
    const fullSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!fullSession) {
      return null;
    }

    const { session, user } = fullSession;

    return {
      session,
      user,
      activeOrganizationId: session.activeOrganizationId ?? null,
    };
  } catch (error) {
    if (error instanceof APIError) {
      if (error.statusCode === 500) {
        throw new Error("Error de conexión con la base de datos.");
      }
      return null;
    }

    // Re-throw non-API errors (e.g., redirect errors from Next.js)
    throw error;
  }
};

/**
 * Get the current server session with required organization.
 * @throws Error if no session or no active organization
 */
export const getServerSessionWithOrg = async (): Promise<
  ServerSession & { activeOrganizationId: string }
> => {
  const sessionData = await getServerSession();

  if (!sessionData) {
    throw new Error("Unauthorized: No active session");
  }

  const { session, user, activeOrganizationId } = sessionData;

  if (!activeOrganizationId) {
    throw new Error("Unauthorized: No active organization");
  }

  return {
    session,
    user,
    activeOrganizationId,
  };
};

/**
 * Get the current server session and ensure the user is a superuser (admin).
 * @throws Error if no session or user is not an admin
 */
export const requireSuperUser = async (): Promise<ServerSession> => {
  const sessionData = await getServerSession();

  if (!sessionData) {
    throw new Error("Unauthorized: No active session");
  }

  const { session, user, activeOrganizationId } = sessionData;

  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized: Super user access required");
  }

  return {
    session,
    user,
    activeOrganizationId,
  };
};
