import { getIngredients } from "@/actions/ingredients";
import { getProducts } from "@/actions/products";
import {
  CreateProductModal,
  EditProductModal,
} from "@/components/modals/ProductModals";
import { PageHeader } from "@/components/PageHeader";
import { ProductTableRow } from "@/components/ProductTableRow";
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

interface PageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { edit } = await searchParams;
  const products = await getProducts();
  const ingredients = await getIngredients();

  const editingProduct = edit ? products.find((p) => p.id === edit) : undefined;

  return (
    <div className="min-h-screen p-8 space-y-8 bg-linear-to-br from-gray-50 to-white text-black">
      <PageHeader
        title="Productos & Recetas"
        gradient="purple"
        breadcrumbs={breadcrumbs}
        backLink={{ href: "/dashboard", label: "Volver al Dashboard" }}
        actions={
          <CreateProductModal
            ingredients={ingredients}
            subProducts={products}
          />
        }
      />

      <div className="">
        <Card className="rounded-2xl shadow-xl border-gray-100">
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

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          ingredients={ingredients}
          subProducts={products}
        />
      )}
    </div>
  );
}
