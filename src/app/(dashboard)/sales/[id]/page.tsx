import { Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSaleById } from "@/actions/sales";
import { FormattedDate } from "@/components/FormattedDate";
import { PageHeader } from "@/components/PageHeader";
import { SaleActions } from "@/components/SaleActions";
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SaleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) {
    notFound();
  }

  const breadcrumbs = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/sales", label: "Ventas" },
    { href: `/sales/${id}`, label: `Detalle Venta` },
  ];

  const totalItems = sale.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="p-4 sm:p-6 space-y-8 bg-linear-to-br from-gray-50 to-white min-h-screen">
      <PageHeader
        title={`Detalle de Venta`}
        gradient="green"
        breadcrumbs={breadcrumbs}
        backLink={{ href: "/sales", label: "Volver a Ventas" }}
        actions={
          <div className="flex gap-2">
            <Link href={`/sales/${id}/edit`}>
              <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <SaleActions saleId={id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="lg:col-span-1 shadow-md border-gray-100 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Fecha y Hora</p>
              <div className="font-medium text-gray-900">
                <FormattedDate date={sale.dateTime} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Items Totales</p>
              <div className="font-medium text-gray-900">{totalItems} unidades</div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monto Total</p>
              <div className="text-2xl font-bold text-green-600">
                ${sale.totalAmount.toFixed(2)}
              </div>
            </div>
            {sale.notes && (
              <div>
                <p className="text-sm text-gray-500">Notas</p>
                <div className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
                  {sale.notes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="lg:col-span-2 shadow-xl border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg">Desglose de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Cant.</TableHead>
                  <TableHead className="text-right">Precio Unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
