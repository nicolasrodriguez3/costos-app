"use client";

import { useRouter } from "next/navigation";

import type { Ingredient, Product, ProductWithRelations } from "@/types";
import { ProductForm } from "../forms/ProductForm";
import { CreateResourceModal, EditResourceModal } from "./ResourceModal";

interface ProductModalProps {
  ingredients: Ingredient[];
  subProducts?: Product[];
}

export function CreateProductModal({
  ingredients,
  subProducts,
}: ProductModalProps) {
  return (
    <CreateResourceModal
      triggerLabel="Agregar Producto"
      title="Nuevo Producto"
      description="Sigue los pasos para configurar tu nuevo producto o receta."
    >
      <ProductForm ingredients={ingredients} subProducts={subProducts} />
    </CreateResourceModal>
  );
}

export function EditProductModal({
  product,
  ingredients,
  subProducts,
}: ProductModalProps & { product: ProductWithRelations }) {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.push("/products");
    }
  };

  return (
    <EditResourceModal
      open={true}
      onOpenChange={handleOpenChange}
      title="Editar Producto"
      description="Modifica los detalles, receta o precio del producto."
    >
      <ProductForm
        product={product}
        ingredients={ingredients}
        subProducts={subProducts}
      />
    </EditResourceModal>
  );
}
