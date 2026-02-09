"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";

export function SetActiveOrganization({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    async function setActive() {
      await authClient.organization.setActive({
        organizationId,
      });
      router.refresh();
    }
    setActive();
  }, [organizationId, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Sincronizando organización...</p>
      </div>
    </div>
  );
}
