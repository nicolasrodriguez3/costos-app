import Link from "next/link";

import { deleteIngredient, getIngredients } from "@/actions/ingredients";
import { IngredientForm } from "@/components/IngredientForm";
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
    <div className="min-h-screen p-4 space-y-8 bg-linear-to-br from-gray-50 to-white text-black">
      <PageHeader
        title="Ingredientes"
        gradient="orange"
        breadcrumbs={breadcrumbs}
        backLink={{ href: "/dashboard", label: "Volver al Dashboard" }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <IngredientForm ingredient={editingIngredient} />
        </div>

        <div className="lg:col-span-2">
          <Card className="border-gray-500/10 shadow-sm">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">Listado</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-700">
                      <th className="pr-3 font-medium">Nombre</th>
                      <th className="p-3 font-medium">Unidad</th>
                      <th className="p-3 font-medium">Stock</th>
                      <th className="p-3 font-medium">Costo/Unidad</th>
                      <th className="pl-3 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ing) => (
                      <tr
                        key={ing.id}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors group ${
                          editingIngredient?.id === ing.id
                            ? "bg-orange-500/10"
                            : ""
                        }`}
                      >
                        <td className="pr-3 font-medium text-gray-900">
                          {ing.name}
                        </td>
                        <td className="p-3 text-gray-900">{ing.unit}</td>
                        <td className="p-3">
                          <span
                            className={`font-mono text-sm ${ing.isLowStock ? "text-red-400" : "text-green-400"}`}
                          >
                            {ing.currentStock.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-green-400 font-mono">
                          ${(ing.lastCost || 0).toFixed(2)}
                        </td>
                        <td className="pl-3 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            <Link
                              href={`/ingredients?edit=${ing.id}`}
                              className="text-sm px-3 py-1 rounded bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition opacity-80 group-hover:opacity-100 focus:opacity-100"
                            >
                              Editar
                            </Link>
                            <button className="text-sm px-3 py-1 rounded bg-green-500/10 text-green-600 hover:bg-green-500/20 transition opacity-80 group-hover:opacity-100 focus:opacity-100">
                              Comprar
                            </button>
                            <form action={deleteIngredient.bind(null, ing.id)}>
                              <button className="text-sm px-3 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition opacity-80 group-hover:opacity-100 focus:opacity-100">
                                Borrar
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {ingredients.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
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
      </div>
    </div>
  );
}
