"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

export function SetActiveOrganization({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setActive() {
      try {
        const result = await authClient.organization.setActive({
          organizationId,
        });

        if (result.error) {
          setError(result.error.message || "Error al activar organización");
          toast.error("Error al activar organización");
          return;
        }

        router.refresh();
      } catch (err) {
        console.error("Failed to set active organization:", err);
        setError("Error inesperado al sincronizar");
        toast.error("Error inesperado al sincronizar organización");
      }
    }
    setActive();
  }, [organizationId, router]);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push("/onboarding")}
            className="text-sm text-primary underline"
          >
            Ir a configuración
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Sincronizando organización...</p>
      </div>
    </div>
  );
}
