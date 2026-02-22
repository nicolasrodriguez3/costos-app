import Link from "next/link";

import { getDashboardStats } from "@/actions/dashboard";
import { FormattedDate } from "@/components/FormattedDate";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function Home() {
  const stats = await getDashboardStats();
  const grossProfit = stats.totalProfit; // Total sales - sum of unitCost
  const operatingProfit = grossProfit - (stats.totalFixedCosts || 0);

  const marginPercent =
    stats.totalRevenue > 0 ? (grossProfit / stats.totalRevenue) * 100 : 0;

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader title="Dashboard" />
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
        <StatCard
          title="Ventas (Todo)"
          value={`$${stats.totalRevenue.toFixed(0)}`}
          color="green"
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
        />
        <StatCard
          title="Margen Bruto"
          value={`${marginPercent.toFixed(1)}%`}
          color="orange"
        />
      </div>

      {/* Navigation Grid */}
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

      {/* Recent Activity */}
      <Card className="border-gray-500/10 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Ventas Recientes</h2>
            <Link
              href="/sales/history"
              className="text-sm text-green-600 hover:text-green-700 hover:underline"
            >
              Ver historial completo →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-500/10 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="pb-4 font-medium">Fecha y Hora</th>
                  <th className="pb-4 font-medium">Items</th>
                  <th className="pb-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-500/10">
                {stats.recentSales.map((sale) => (
                  <tr key={sale.id} className="text-gray-600">
                    <td className="py-4">
                      <FormattedDate date={sale.dateTime} />
                    </td>
                    <td className="py-4">
                      {sale.items
                        .map((i) => `${i.quantity}x ${i.product.name}`)
                        .join(", ")}
                    </td>
                    <td className="py-4 text-right font-mono text-green-400">
                      ${sale.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {stats.recentSales.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-gray-500 italic"
                    >
                      No hay ventas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
