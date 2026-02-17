import { getIngredients } from "@/actions/ingredients";
import { PageHeader } from "@/components/PageHeader";
import { PurchaseForm } from "@/components/PurchaseForm";
import { IngredientWithStock } from "@/types";

export default async function NewPurchasePage() {
  const ingredients = (await getIngredients()) as IngredientWithStock[];

  const breadcrumbs = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/purchases", label: "Compras" },
    { href: "/purchases/new", label: "Nueva Compra" },
  ];

  return (
    <div className="p-4 space-y-8">
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
