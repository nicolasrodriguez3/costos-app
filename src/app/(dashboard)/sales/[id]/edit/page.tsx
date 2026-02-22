import { notFound } from "next/navigation";

import { getActiveProducts } from "@/actions/products";
import { getSaleById } from "@/actions/sales";
import { SaleForm } from "@/components/forms/SaleForm";
import { PageHeader } from "@/components/PageHeader";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSalePage({ params }: PageProps) {
  const { id } = await params;
  const [sale, products] = await Promise.all([
    getSaleById(id),
    getActiveProducts(),
  ]);

  if (!sale) {
    notFound();
  }

  const breadcrumbs = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/sales", label: "Ventas" },
    { href: `/sales/${id}`, label: `Detalle` },
    { href: `/sales/${id}/edit`, label: "Editar" },
  ];

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Editar Venta"
        gradient="green"
        breadcrumbs={breadcrumbs}
        backLink={{ href: `/sales/${id}`, label: "Volver al Detalle" }}
      />

      <div className="max-w-4xl mx-auto">
        <SaleForm products={products} sale={sale} />
      </div>
    </div>
  );
}
