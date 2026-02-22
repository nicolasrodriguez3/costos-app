import { getIngredients } from "@/actions/ingredients";
import { PurchaseForm } from "@/components/forms/PurchaseForm";
import { PageHeader } from "@/components/PageHeader";
import type { IngredientWithStock } from "@/types/entities/ingredient";

export default async function NewPurchasePage() {
  const ingredients = (await getIngredients()) as IngredientWithStock[];

  const breadcrumbs = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/purchases", label: "Compras" },
    { href: "/purchases/new", label: "Nueva Compra" },
  ];

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Compras de Ingredientes"
        gradient="orange"
        breadcrumbs={breadcrumbs}
        backLink={{ href: "/dashboard", label: "Volver al Dashboard" }}
      />

      <div className="">
        <div className="">
          <PurchaseForm ingredients={ingredients} />
        </div>
      </div>
    </div>
  );
}
