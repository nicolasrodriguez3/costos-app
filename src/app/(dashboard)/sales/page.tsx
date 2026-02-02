import { PageHeader } from "@/components/PageHeader";
import { getProductsForPOS } from "@/actions/products";
import { POSInterface } from "@/components/POSInterface";
import Link from "next/link";

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/sales", label: "Ventas" },
];

export default async function SalesPage() {
  const products = await getProductsForPOS();

  return (
    <div className="h-screen flex flex-col p-4 sm:p-6 overflow-hidden bg-linear-to-br from-gray-50 to-white text-black">
      <PageHeader
        title="Ventas"
        gradient="green"
        actions={
          <Link
            href="/sales/history"
            className="text-sm text-green-600 hover:text-green-700 hover:underline"
          >
            Ver historial →
          </Link>
        }
        breadcrumbs={breadcrumbs}
        backLink={{ href: "/dashboard", label: "Volver al Dashboard" }}
      />

      <div className="flex-1 min-h-0">
        <POSInterface products={products} />
      </div>
    </div>
  );
}
