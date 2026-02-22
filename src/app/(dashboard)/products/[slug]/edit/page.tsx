import { notFound } from "next/navigation";

import { getIngredients } from "@/actions/ingredients";
import { getProductBySlug, getProducts } from "@/actions/products";
import { ProductForm } from "@/components/forms/ProductForm";
import { PageHeader } from "@/components/PageHeader";
import { getServerSessionWithOrg } from "@/lib/serverSession";
import type { IngredientWithStock } from "@/types/entities/ingredient";

export default async function ProductEditPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const { activeOrganizationId } = await getServerSessionWithOrg();
  const [product, ingredientsRaw, products] = await Promise.all([
    getProductBySlug(slug),
    getIngredients(),
    getProducts(),
  ]);

  const ingredients = ingredientsRaw as IngredientWithStock[];

  if (!product) {
    notFound();
  }

  const breadcrumbs = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/products", label: "Productos" },
    { href: `/products/${product.slug}`, label: product.name },
    { href: `/products/${product.slug}/edit`, label: "Editar" },
  ];

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title={`Editar ${product.name}`}
        gradient="purple"
        breadcrumbs={breadcrumbs}
        backLink={{
          href: `/products/${product.slug}`,
          label: "Volver al Producto",
        }}
      />
      <div className="max-w-4xl mx-auto mt-8">
        <ProductForm
          initialData={product}
          ingredients={ingredients}
          products={products}
          organizationId={activeOrganizationId}
        />
      </div>
    </div>
  );
}
