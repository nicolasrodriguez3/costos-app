import { getIngredients } from "@/actions/ingredients";
import { getProducts } from "@/actions/products";
import { ProductForm } from "@/components/forms/ProductForm";
import { PageHeader } from "@/components/PageHeader";
import { getServerSessionWithOrg } from "@/lib/serverSession";
import type { IngredientWithStock } from "@/types";

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/products", label: "Productos" },
  { href: "/products/new", label: "Nuevo Producto" },
];

export default async function ProductsNewPage() {
  const session = await getServerSessionWithOrg();
  const organizationId = session.activeOrganizationId;

  const [ingredientsRaw, products] = await Promise.all([
    getIngredients(),
    getProducts(),
  ]);

  const ingredients = ingredientsRaw as IngredientWithStock[];

  return (
    <div className="min-h-screen p-8 space-y-8 bg-linear-to-br from-gray-50 to-white text-black">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Nuevo Producto"
        gradient="purple"
        backLink={{ href: "/products", label: "Volver al Catalogo" }}
      />

      <div className="max-w-4xl mx-auto mt-8">
        <ProductForm
          ingredients={ingredients}
          products={products}
          organizationId={organizationId}
        />
      </div>
    </div>
  );
}
