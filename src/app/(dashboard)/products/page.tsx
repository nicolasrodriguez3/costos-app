import Link from "next/link";

import { getProducts } from "@/actions/products";
import { PageHeader } from "@/components/PageHeader";
import { ProductTableRow } from "@/components/ProductTableRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/products", label: "Productos" },
];

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Productos & Recetas"
        gradient="purple"
        breadcrumbs={breadcrumbs}
        actions={
          <Button asChild variant="ghost">
            <Link
              href="/products/new"
              className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 hover:text-purple-600 transition"
            >
              Agregar Producto
            </Link>
          </Button>
        }
      />

      <Card className="rounded-2xl shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Catalogo de Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="font-medium text-gray-700">
                    Nombre
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Tipo
                  </TableHead>
                  <TableHead className="font-medium text-right text-gray-700">
                    Precio de venta
                  </TableHead>
                  <TableHead className="font-medium text-right text-gray-700">
                    Costo
                  </TableHead>
                  <TableHead className="font-medium text-right text-gray-700">
                    Beneficio
                  </TableHead>
                  <TableHead className="font-medium text-right text-gray-700">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <ProductTableRow key={product.id} product={product} />
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-gray-500 italic"
                    >
                      No se encontraron productos. ¡Crea tu primera Pizza!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
