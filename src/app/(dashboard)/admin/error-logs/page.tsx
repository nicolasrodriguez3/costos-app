import { Suspense } from "react";

import { getErrorLogs } from "@/actions/errorLogs";
import { PageHeader } from "@/components/PageHeader";
import { requireSuperUser } from "@/lib/serverSession";
import { ErrorLogsView } from "./error-logs-view";

interface PageProps {
  searchParams: Promise<{
    limit?: string;
    level?: string;
    action?: string;
  }>;
}

export default async function ErrorLogsPage({ searchParams }: PageProps) {
  // Protect the page: only superusers can access it
  await requireSuperUser();

  const resolvedParams = await searchParams;
  const limit = resolvedParams.limit ? parseInt(resolvedParams.limit) : 20;

  const initialData = await getErrorLogs({
    limit,
    level: resolvedParams.level,
    action: resolvedParams.action,
  });

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Registro de Errores"
        subtitle="Monitorea los errores, advertencias del sistema y logs."
      />

      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center">
            Cargando logs...
          </div>
        }
      >
        <ErrorLogsView initialData={initialData} />
      </Suspense>
    </div>
  );
}
