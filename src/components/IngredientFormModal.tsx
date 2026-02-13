"use client";

import { useRouter } from "next/navigation";

import { IngredientForm } from "@/components/forms/IngredientForm";
import {
  CreateResourceModal,
  EditResourceModal,
} from "@/components/modals/ResourceModal";
import type { Ingredient } from "@/types";

export function CreateIngredientModal() {
  return (
    <CreateResourceModal
      triggerLabel="Agregar Ingrediente"
      title="Agregar Ingrediente"
      description="Completa los datos para crear un nuevo ingrediente."
    >
      <IngredientForm />
    </CreateResourceModal>
  );
}

export function EditIngredientModal({
  ingredient,
}: {
  ingredient: Ingredient;
}) {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.push("/ingredients");
    }
  };

  return (
    <EditResourceModal
      open={true}
      onOpenChange={handleOpenChange}
      title="Editar Ingrediente"
      description="Modifica los detalles del ingrediente."
    >
      <IngredientForm ingredient={ingredient} />
    </EditResourceModal>
  );
}
