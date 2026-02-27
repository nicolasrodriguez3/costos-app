import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

import { getSalesHistory } from "@/actions/sales";
import { FormattedDate } from "@/components/FormattedDate";
import { PageHeader } from "@/components/PageHeader";
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
  { href: "/sales/history", label: "Historial de Ventas" },
];

export default async function SalesHistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { startDate, endDate, search, cursor } = params;

  const result = await getSalesHistory({
    startDate,
    endDate,
    search,
    cursor,
  });

  const { sales, hasMore, totalCount, periodStats } = result;
  const lastSale = sales[sales.length - 1];

  // Build URL for "Load More"
  const loadMoreParams = new URLSearchParams();
  if (startDate) loadMoreParams.set("startDate", startDate);
  if (endDate) loadMoreParams.set("endDate", endDate);
  if (search) loadMoreParams.set("search", search);
  if (lastSale) loadMoreParams.set("cursor", lastSale.id);

  const marginPercent =
    periodStats.revenue > 0
      ? (periodStats.profit / periodStats.revenue) * 100
      : 0;

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Historial de Ventas"
        gradient="green"
        breadcrumbs={breadcrumbs}
        backLink={{ href: "/sales", label: "Volver a Ventas" }}
      />

      {/* Filters */}
      <SalesFilters
        initialStartDate={startDate || ""}
        initialEndDate={endDate || ""}
        initialSearch={search || ""}
      />

      {/* Period Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Ventas</p>
                <p className="text-xl font-bold text-gray-900">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ingresos</p>
                <p className="text-xl font-bold text-green-600">
                  ${periodStats.revenue.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">C. variables</p>
                <p className="text-xl font-bold text-red-600">
                  ${periodStats.cost.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Margen Bruto</p>
                <p className="text-xl font-bold text-orange-600">
                  ${(periodStats.grossProfit || 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <TrendingDown size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Costos Fijos</p>
                <p className="text-xl font-bold text-indigo-600">
                  ${(periodStats.fixedCosts || 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ut. Operativa</p>
                <p
                  className={`text-xl font-bold ${(periodStats.operatingProfit || 0) >= 0 ? "text-purple-600" : "text-red-600"}`}
                >
                  ${(periodStats.operatingProfit || 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card className="rounded-2xl shadow-xl border-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Ventas{" "}
            {totalCount > 0 && (
              <span className="text-base font-normal text-gray-500">
                ({totalCount} {totalCount === 1 ? "venta" : "ventas"})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="font-medium text-gray-700">
                  Fecha
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Productos
                </TableHead>
                <TableHead className="font-medium text-right text-gray-700">
                  Total
                </TableHead>
                <TableHead className="font-medium text-right text-gray-700">
                  Costo
                </TableHead>
                <TableHead className="font-medium text-right text-gray-700">
                  Beneficio
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => {
                const saleCost = sale.items.reduce(
                  (acc, item) => acc + (item.unitCost || 0) * item.quantity,
                  0,
                );
                const saleProfit = sale.totalAmount - saleCost;

                return (
                  <TableRow
                    key={sale.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <FormattedDate date={sale.dateTime} type="date" />
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {sale.items
                        .map((i) => `${i.quantity}x ${i.product.name}`)
                        .join(", ")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      ${sale.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-500">
                      ${saleCost.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono ${saleProfit >= 0 ? "text-purple-600" : "text-red-600"}`}
                    >
                      ${saleProfit.toFixed(2)} ({marginPercent.toFixed(2)}%)
                    </TableCell>
                  </TableRow>
                );
              })}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-gray-500 italic"
                  >
                    No se encontraron ventas con los filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Link href={`/sales/history?${loadMoreParams.toString()}`}>
                <Button variant="outline" className="px-8">
                  Cargar más
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
