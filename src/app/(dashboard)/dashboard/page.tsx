import Link from "next/link";
import { Suspense } from "react";

import { getDashboardStats, type Period } from "@/actions/dashboard";
import { FormattedDate } from "@/components/FormattedDate";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { TimeFilter } from "@/components/TimeFilter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = {
  title: "Dashboard",
};

async function DashboardContent({ period }: { period: Period }) {
  const stats = await getDashboardStats(period);
  const grossProfit = stats.totalProfit;
  const operatingProfit = grossProfit - (stats.totalFixedCosts || 0);

  const marginPercent =
    stats.totalRevenue > 0 ? (grossProfit / stats.totalRevenue) * 100 : 0;

  const hasPreviousData =
    stats.previousPeriod && stats.previousPeriod.revenue > 0;

  const revenueChange = stats.previousPeriod?.revenueChange;
  const profitChange = stats.previousPeriod?.profitChange;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        <StatCard
          title="Ventas"
          value={`$${stats.totalRevenue.toFixed(0)}`}
          color="green"
          change={hasPreviousData ? revenueChange : undefined}
        />
        <StatCard
          title="Costos Var."
          value={`$${stats.totalCost.toFixed(0)}`}
          color="red"
        />
        <StatCard
          title="Gastos Fijos"
          value={`$${(stats.totalFixedCosts || 0).toFixed(0)}`}
          color="blue"
        />
        <StatCard
          title="Utilidad Op."
          value={`$${operatingProfit.toFixed(0)}`}
          color={operatingProfit >= 0 ? "purple" : "red"}
          change={hasPreviousData ? profitChange : undefined}
        />
        <StatCard
          title="Margen Bruto"
          value={`${marginPercent.toFixed(1)}%`}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-500/10 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Productos Más Vendidos</h2>
            </div>
          </CardHeader>
          <CardContent>
            {stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.quantity} unidades
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">
                        ${product.revenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 italic">
                No hay ventas en este período.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-500/10 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Ventas Recientes</h2>
              <Link
                href="/sales/history"
                className="text-sm text-green-600 hover:text-green-700 hover:underline"
              >
                Ver historial completo →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex">
            <Table className="text-left h-full">
              <TableHeader>
                <TableRow className="border-b border-gray-500/10 text-gray-500 hover:bg-transparent">
                  <TableHead>Fecha</TableHead>
                  <TableHead className="px-2">Productos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody >
                {stats.recentSales.map((sale) => (
                  <TableRow key={sale.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <TableCell>
                      <FormattedDate date={sale.dateTime} type="date" />
                    </TableCell>
                    <TableCell className="px-2 max-w-md truncate">
                      {sale.items
                        .map((i) => `${i.quantity}x ${i.product.name}`)
                        .join(", ")}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-500">
                      ${sale.totalAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                {stats.recentSales.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-gray-500 italic"
                    >
                      No hay ventas en este período.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div >
    </>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period as Period) || "month";

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader title="Dashboard" actions={<TimeFilter />} />

      <Suspense
        fallback={
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-100 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-100 rounded-2xl" />
              <div className="h-64 bg-gray-100 rounded-2xl" />
            </div>
          </div>
        }
      >
        <DashboardContent period={period} />
      </Suspense>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/ingredients"
          className="group rounded-2xl border border-gray-500/10 bg-gray-400/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 flex flex-col items-center text-center"
        >
          <div className="h-14 w-14 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 group-hover:bg-orange-500/30 text-2xl">
            🥕
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ingredientes</h2>
          <p className="text-sm text-gray-600">
            Gestiona los ingredientes y sus costos.
          </p>
        </Link>

        <Link
          href="/products"
          className="group rounded-2xl border border-gray-500/10 bg-gray-400/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 flex flex-col items-center text-center"
        >
          <div className="h-14 w-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-2xl">
            🍕
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Recetas y Productos
          </h2>
          <p className="text-sm text-gray-600">
            Crea recetas y calcula los margenes.
          </p>
        </Link>

        <Link
          href="/expenses"
          className="group rounded-2xl border border-gray-500/10 bg-gray-400/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 flex flex-col items-center text-center"
        >
          <div className="h-14 w-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-2xl">
            📉
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Gastos Fijos</h2>
          <p className="text-sm text-gray-600">
            Alquiler, sueldos y servicios.
          </p>
        </Link>

        <Link
          href="/sales"
          className="group rounded-2xl border border-gray-500/10 bg-gray-400/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 flex flex-col items-center text-center"
        >
          <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-2xl">
            💰
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ventas & POS</h2>
          <p className="text-sm text-gray-600">Interfaz de transacciones.</p>
        </Link>
      </div>
    </div>
  );
}
