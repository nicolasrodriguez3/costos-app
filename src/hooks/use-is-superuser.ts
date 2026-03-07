import { useSession } from "@/lib/auth-client";

export function useIsSuperUser() {
  const { data: session, isPending } = useSession();

  // The Better Auth admin plugin adds the role property to the user object
  const isSuperUser = session?.user?.role === "ADMIN";

  return {
    isSuperUser,
    isPending,
  };
}
