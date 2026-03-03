import { PencilIcon } from "lucide-react";
import Link from "next/link";

import { deleteIngredient, getIngredients } from "@/actions/ingredients";
import { DeleteModal } from "@/components/modals/DeleteModal";
import {
  CreateIngredientModal,
  EditIngredientModal,
} from "@/components/modals/IngredientFormModal";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = {
  title: "Ingredientes",
};

interface PageProps {
  searchParams: Promise<{ edit?: string }>;
}

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/ingredients", label: "Ingredientes" },
];

export default async function IngredientsPage({ searchParams }: PageProps) {
  const { edit } = await searchParams;
  const ingredients = await getIngredients();

  const editingIngredient = edit
    ? ingredients.find((ing) => ing.id === edit)
    : undefined;

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Ingredientes"
        gradient="orange"
        breadcrumbs={breadcrumbs}
        actions={<CreateIngredientModal />}
      />

      <div>
        <Card className="rounded-2xl shadow-sm border border-gray-100">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">
              Inventario de Ingredientes
            </h2>
          </CardHeader>
          <CardContent>
            <Table className="w-full text-left border-collapse hover:bg-transparent">
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Costo/Unidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ing) => (
                  <TableRow
                    key={ing.id}
                    className={`text-gray-700 border-b border-gray-100 hover:bg-gray-50 transition-colors group ${editingIngredient?.id === ing.id ? "bg-orange-50" : ""
                      }`}
                  >
                    <TableCell className="font-medium">
                      {ing.name}
                    </TableCell>
                    <TableCell>{ing.unit}</TableCell>
                    <TableCell>
                      <span
                        className={`font-mono ${ing.currentStock <= 0 || ing.isLowStock
                          ? "text-red-500 font-bold"
                          : "text-green-600"
                          }`}
                      >
                        {ing.currentStock.toFixed(2)}
                      </span>
                      {Boolean(ing.minStock) && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({ing.minStock} min)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono">
                      ${(ing.lastCost || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Button asChild variant="ghost" size="icon">
                          <Link
                            href={`/ingredients?edit=${ing.id}`}
                            aria-label="Editar"
                            className="text-orange-600 hover:bg-orange-100 hover:text-orange-600"
                          >
                            <PencilIcon className="size-4" />
                          </Link>
                        </Button>
                        <DeleteModal
                          id={ing.id}
                          name={ing.name}
                          type="ingrediente"
                          action={deleteIngredient}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {ingredients.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="p-8 text-center text-gray-500 italic"
                    >
                      No se encontraron ingredientes. Agrega uno para
                      comenzar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal (Rendered if ID matches) */}
      {editingIngredient && (
        <EditIngredientModal ingredient={editingIngredient} />
      )}
    </div>
  );
}
