import { notFound } from "next/navigation";

import { getActiveProducts } from "@/actions/products";
import { getSaleById } from "@/actions/sales";
import { PageHeader } from "@/components/PageHeader";
import { SaleForm } from "@/components/forms/SaleForm";

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
    <div className="p-4 sm:p-6 space-y-8 bg-linear-to-br from-gray-50 to-white min-h-screen">
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
