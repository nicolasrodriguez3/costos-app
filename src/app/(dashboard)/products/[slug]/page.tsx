import { WarningIcon } from "@phosphor-icons/react/ssr";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductBySlug } from "@/actions/products";
import { convertCost } from "@/actions/utils/unitConversion";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ingredient, ProductBase, RecipeItem } from "@/types";

interface CalculableIngredient extends Ingredient {
  cost: number;
}

interface CalculableRecipeItem
  extends Omit<RecipeItem, "ingredient" | "subProduct"> {
  ingredient?: CalculableIngredient | null;
  subProduct?: CalculableProduct | null;
}

interface CalculableProduct extends ProductBase {
  receipeItems?: CalculableRecipeItem[];
}

// Helper to calculate cost recursively
const calculateCost = (product: CalculableProduct): number => {
  if (product.type !== "ELABORADO") {
    return product.manualCost ?? 0;
  }

  let totalCost = 0;
  if (product.receipeItems) {
    product.receipeItems.forEach((item) => {
      if (item.ingredient) {
        totalCost += convertCost(
          item.quantity,
          item.unit,
          item.ingredient.unit,
          item.ingredient.cost,
        );
      } else if (item.subProduct) {
        totalCost += item.quantity * calculateCost(item.subProduct);
      }
    });
  }
  return totalCost;
};

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug((await params).slug);

  if (!product) {
    notFound();
  }

  const breadcrumbs = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/products", label: "Productos" },
    { href: `/products/${product.slug}`, label: product.name },
  ];

  const cost = calculateCost(product as unknown as CalculableProduct);
  const benefit = product.basePrice - cost;
  const margin =
    product.basePrice > 0 ? (benefit / product.basePrice) * 100 : 0;

  return (
    <div className="p-4 space-y-8">
      <PageHeader
        title={product.name}
        gradient="purple"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/products/${product.slug}/edit`}>
              <Button variant="default" className="gap-2 cursor-pointer">
                <Edit className="w-4 h-4" /> Editar
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="cursor-pointer gap-2 border bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
            >
              <Trash2 className="w-4 h-4" /> Eliminar
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alert si el producto no tiene precio */}
        {product.basePrice === 0 && (
          <Alert variant="warning" className="text-amber-700 lg:col-span-3">
            <AlertTitle className="flex items-center gap-2">
              <WarningIcon /> Producto sin precio
            </AlertTitle>
            <AlertDescription>
              Este producto no tiene un precio definido. Por favor, actualiza el
              producto para establecer un precio.
            </AlertDescription>
          </Alert>
        )}
        {/* Main Info */}
        <div className="space-y-8 lg:col-span-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Badge
              variant="outline"
              className={`text-sm px-3 py-1 ${
                product.type === "ELABORADO"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {product.type}
            </Badge>
            {product.category && (
              <Badge
                variant="secondary"
                className="text-sm px-3 py-1 bg-gray-100 text-gray-700"
              >
                {product.category}
              </Badge>
            )}
            {product.subCategory && (
              <>
                <span className="text-gray-300">•</span>
                <Badge
                  variant="secondary"
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700"
                >
                  {product.subCategory}
                </Badge>
              </>
            )}
          </div>
          {product.description && (
            <Card className="border-gray-500/10 shadow-sm">
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          )}

          {product.type === "ELABORADO" &&
            product.receipeItems &&
            product.receipeItems.length > 0 && (
              <Card className="border-gray-500/10 shadow-lg overflow-hidden pt-0">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pt-6">
                  <CardTitle className="text-xl">
                    Ficha Técnica (Receta)
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead>Ingrediente / Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">
                          Costo Unit.
                        </TableHead>
                        <TableHead className="text-right font-bold text-gray-900">
                          Costo Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(
                        product.receipeItems as unknown as CalculableRecipeItem[]
                      ).map((item) => {
                        const isIngredient = !!item.ingredient;
                        const name = isIngredient
                          ? item.ingredient?.name
                          : item.subProduct?.name;
                        const baseCost = isIngredient
                          ? item.ingredient?.cost || 0 // Displaying mostly per unit? Wait, cost is usually per unit. Let's just show the total calculated cost.
                          : calculateCost(item.subProduct as CalculableProduct);

                        // For single unit display, it's tricky with units. Let's just show total cost for this line item.
                        const lineCost = isIngredient
                          ? convertCost(
                              item.quantity,
                              item.unit,
                              item.ingredient?.unit || "",
                              item.ingredient?.cost || 0,
                            )
                          : item.quantity *
                            calculateCost(item.subProduct as CalculableProduct);

                        return (
                          <TableRow
                            key={item.id}
                            className="hover:bg-gray-50 border-b border-gray-100"
                          >
                            <TableCell className="font-medium text-gray-700">
                              {name}
                              {!isIngredient && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs border-blue-200 text-blue-600 bg-blue-50"
                                >
                                  Sub-Producto
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {item.quantity} {item.unit}
                            </TableCell>
                            <TableCell className="text-right text-gray-500 text-sm">
                              {/* Showing unit cost might be confusing if units differ. Skipping for clarity or just show total */}
                              ${baseCost}
                            </TableCell>
                            <TableCell className="text-right font-medium text-gray-900">
                              ${lineCost.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-gray-50 font-bold border-t-2 border-gray-100">
                        <TableCell
                          colSpan={3}
                          className="text-right text-gray-900"
                        >
                          Costo Total de Receta
                        </TableCell>
                        <TableCell className="text-right text-gray-900 text-lg">
                          ${cost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sidebar Stats */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-linear-to-b from-gray-900 to-gray-800 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 blur-3xl bg-purple-500 w-32 h-32 rounded-full pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-gray-200">
                Resumen Financiero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Precio de Venta
                </p>
                <p className="text-4xl font-bold tracking-tight text-white">
                  ${product.basePrice.toFixed(2)}
                </p>
              </div>

              <Separator className="bg-gray-700" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Costo
                  </p>
                  <p className="text-xl font-semibold text-red-300">
                    -${cost.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Margen
                  </p>
                  <Badge
                    className={`${
                      margin > 30
                        ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                        : margin > 0
                          ? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                          : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    } border-none`}
                  >
                    {margin.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mt-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Beneficio Neto</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${benefit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Detalles Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Categoría</span>
                <span className="font-medium">{product.category || "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Sub-categoría</span>
                <span className="font-medium">
                  {product.subCategory || "-"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">ID Producto</span>
                <span
                  className="font-mono text-xs text-gray-400 truncate w-32 text-right"
                  title={product.id}
                >
                  {product.id}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
