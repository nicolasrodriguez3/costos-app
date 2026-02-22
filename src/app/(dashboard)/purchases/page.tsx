import { Blocks, Receipt } from "lucide-react";
import Link from "next/link";

import { getIngredients } from "@/actions/ingredients";
import { getPurchases } from "@/actions/purchases";
import { PageHeader } from "@/components/PageHeader";
import { PurchaseHistory } from "@/components/PurchaseHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IngredientWithStock, Purchase } from "@/types";

const breadcrumbs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/purchases", label: "Compras" },
];

export default async function PurchasesPage() {
  const ingredients = (await getIngredients()) as IngredientWithStock[];
  const purchases = (await getPurchases()) as Purchase[];

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Compras de Ingredientes"
        gradient="orange"
        breadcrumbs={breadcrumbs}
        backLink={{ href: "/dashboard", label: "Volver al Dashboard" }}
      />

      <div>
        <div className="mb-4">
          <Link
            href="/purchases/new"
            className="text-sm px-3 py-1 rounded bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition opacity-80 group-hover:opacity-100 focus:opacity-100"
          >
            Agregar Compra
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Blocks className="w-5 h-5" />
                  Resumen de Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ingredients.slice(0, 5).map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {ingredient.name}
                      </p>
                      <p className="text-sm text-gray-500">{ingredient.unit}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-mono text-sm ${
                          ingredient.isLowStock
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {ingredient.currentStock.toFixed(2)}
                      </p>
                      {ingredient.isLowStock && (
                        <p className="text-xs text-red-500">Bajo</p>
                      )}
                    </div>
                  </div>
                ))}
                {ingredients.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    y {ingredients.length - 5} ingredientes más...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="rounded-2xl shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Últimos Costos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ingredients
                  .filter((ing) => ing.lastCost && ing.lastCost > 0)
                  .slice(0, 5)
                  .map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-900">{ingredient.name}</span>
                      <span className="font-mono text-green-600">
                        ${(ingredient.lastCost || 0).toFixed(2)}/
                        {ingredient.unit}
                      </span>
                    </div>
                  ))}
                {ingredients.filter((ing) => ing.lastCost && ing.lastCost > 0)
                  .length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    No hay compras registradas
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Historial completo de compras */}
        <div className="mt-8">
          <PurchaseHistory purchases={purchases} />
        </div>
      </div>
    </div>
  );
}
