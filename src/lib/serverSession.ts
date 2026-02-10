import { APIError } from "better-auth";
import { headers } from "next/headers";

import { auth, type Session } from "./auth";

type ServerSession = {
  session: Session["session"];
  user: Session["user"];
  activeOrganizationId: string | null;
};

/**
 * Get the current server session.
 * @throws Error if no session exists (user not authenticated)
 */
export const getServerSession = async (): Promise<ServerSession> => {
  try {
    const fullSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!fullSession) {
      throw new Error("Unauthorized: No active session");
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
        console.error(
          "[Auth] Error interno al obtener sesión. ¿Está corriendo la base de datos?",
          error.body,
        );
        throw new Error(
          "Error de conexión con la base de datos. Verificá que Docker/PostgreSQL esté corriendo.",
        );
      }
      throw new Error(`Error de autenticación: ${error.message}`);
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
  const { session, user, activeOrganizationId } = await getServerSession();

  if (!activeOrganizationId) {
    throw new Error("Unauthorized: No active organization");
  }

  return {
    session,
    user,
    activeOrganizationId,
  };
};
