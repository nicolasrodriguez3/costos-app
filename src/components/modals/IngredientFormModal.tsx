"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { IngredientForm } from "@/components/forms/IngredientForm";
import {
  CreateResourceModal,
  EditResourceModal,
} from "@/components/modals/ResourceModal";
import { Button } from "@/components/ui/button";
import type { Ingredient } from "@/types/entities/ingredient";

export function CreateIngredientModal() {
  return (
    <CreateResourceModal
      trigger={
        <Button variant="default" className="bg-orange-600 hover:bg-red-600 ">
          <Plus className="mr-1 size-4" />
          Agregar Ingrediente
        </Button>
      }
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
