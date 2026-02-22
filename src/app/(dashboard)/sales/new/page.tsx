import { getActiveProducts } from "@/actions/products";
import { SaleForm } from "@/components/forms/SaleForm";
import { PageHeader } from "@/components/PageHeader";

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/sales", label: "Ventas" },
  { href: "/sales/new", label: "Nueva Venta" },
];

export default async function NewSalePage() {
  const products = await getActiveProducts();

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Nueva Venta Diaria"
        gradient="green"
        breadcrumbs={breadcrumbs}
        backLink={{ href: "/sales", label: "Volver a Ventas" }}
      />

      <div className="max-w-4xl mx-auto">
        <SaleForm products={products} />
      </div>
    </div>
  );
}
