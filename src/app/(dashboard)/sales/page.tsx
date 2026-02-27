import { Edit, Eye, Plus } from "lucide-react";
import Link from "next/link";

import { getSalesHistory } from "@/actions/sales";
import { FormattedDate } from "@/components/FormattedDate";
import { PageHeader } from "@/components/PageHeader";
import { SaleActions } from "@/components/SaleActions";
import { SalesFilters } from "@/components/SalesFilters";
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
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    search?: string;
    cursor?: string;
  }>;
}

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/sales", label: "Ventas" },
];

export default async function SalesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { startDate, endDate, search, cursor } = params;

  const { sales, hasMore, totalCount } = await getSalesHistory({
    startDate,
    endDate,
    search,
    cursor,
  });

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Ventas"
        gradient="green"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Link href="/sales/history">
              <Button variant="outline" size="default">
                Ver Historial & Reporte
              </Button>
            </Link>
            <Link href="/sales/new">
              <Button
                size="default"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-1 size-4" />
                Nueva Venta
              </Button>
            </Link>
          </div>
        }
      />

      <SalesFilters
        initialStartDate={startDate || ""}
        initialEndDate={endDate || ""}
        initialSearch={search || ""}
      />

      <Card className="rounded-2xl shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Listado de Ventas
            {totalCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({totalCount} {totalCount === 1 ? "venta" : "ventas"})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="">Fecha</TableHead>
                <TableHead>Productos / Resumen</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow
                  key={sale.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <TableCell className="font-medium text-gray-900">
                    <FormattedDate date={sale.dateTime} type="date" />
                  </TableCell>
                  <TableCell className="text-gray-600 w-md whitespace-normal">
                    <span
                      className="leading-tight line-clamp-4 w-sm">
                      {sale.items
                        .map((i) => `${i.quantity}x ${i.product.name}`)
                        .join(", ")}</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    ${sale.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm italic whitespace-normal ">
                    <span
                      className="leading-tight line-clamp-2 w-64"
                      title={sale.notes || ""}
                    >
                      {sale.notes || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600"
                      >
                        <Link href={`/sales/${sale.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-orange-600"
                      >
                        <Link href={`/sales/${sale.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <SaleActions saleId={sale.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-gray-500 italic"
                  >
                    No se encontraron ventas cargadas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Link
                href={`/sales?${new URLSearchParams({
                  ...params,
                  cursor: sales[sales.length - 1].id,
                }).toString()}`}
              >
                <Button variant="outline">Cargar más</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
