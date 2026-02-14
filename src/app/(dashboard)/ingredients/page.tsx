import Link from "next/link";

import { deleteIngredient, getIngredients } from "@/actions/ingredients";
import {
  CreateIngredientModal,
  EditIngredientModal,
} from "@/components/IngredientFormModal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <div className="p-4 space-y-8 ">
      <PageHeader
        title="Ingredientes"
        gradient="orange"
        breadcrumbs={breadcrumbs}
        actions={<CreateIngredientModal />}
      />

      <div className="max-w-5xl mx-auto space-y-8">
        <Card className="border-gray-500/10 shadow-sm">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">
              Inventario de Ingredientes
            </h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-700">
                    <th className="p-3 font-medium">Nombre</th>
                    <th className="p-3 font-medium">Unidad</th>
                    <th className="p-3 font-medium">Stock</th>
                    <th className="p-3 font-medium">Costo/Unidad</th>
                    <th className="p-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing) => (
                    <tr
                      key={ing.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors group ${
                        editingIngredient?.id === ing.id ? "bg-orange-50" : ""
                      }`}
                    >
                      <td className="p-3 font-medium text-gray-900">
                        {ing.name}
                      </td>
                      <td className="p-3 text-gray-900">{ing.unit}</td>
                      <td className="p-3">
                        <span
                          className={`font-mono text-sm ${
                            ing.currentStock <= 0 || ing.isLowStock
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
                      </td>
                      <td className="p-3 text-gray-600 font-mono">
                        ${(ing.lastCost || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <Link
                            href={`/ingredients?edit=${ing.id}`}
                            scroll={false}
                            className="text-sm px-3 py-1 rounded bg-orange-50 text-orange-600 hover:bg-orange-100 transition opacity-80 group-hover:opacity-100 focus:opacity-100"
                          >
                            Editar
                          </Link>
                          <DeleteModal
                            id={ing.id}
                            name={ing.name}
                            type="ingrediente"
                            action={deleteIngredient}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {ingredients.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-gray-500 italic"
                      >
                        No se encontraron ingredientes. Agrega uno para
                        comenzar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
