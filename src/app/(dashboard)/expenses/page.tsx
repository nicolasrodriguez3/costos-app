import Link from "next/link";

import { deleteFixedCost, getFixedCosts } from "@/actions/fixedCosts";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "Gastos Fijos",
};

interface PageProps {
  searchParams: Promise<{ edit?: string }>;
}

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/expenses", label: "Gastos Fijos" },
];

export default async function ExpensesPage({ searchParams }: PageProps) {
  const { edit } = await searchParams;
  const fixedCosts = await getFixedCosts();

  const editingExpense = edit
    ? fixedCosts.find((cost) => cost.id === edit)
    : undefined;

  const totalMonthly = fixedCosts.reduce((acc, cost) => acc + cost.amount, 0);

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Gastos Fijos"
        gradient="blue"
        breadcrumbs={breadcrumbs}
        backLink={{ href: "/dashboard", label: "Volver al Dashboard" }}
      />
      <div className="mb-4">
        <Link
          href="/expenses/new"
          className="text-sm px-3 py-1 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition opacity-80 group-hover:opacity-100 focus:opacity-100"
        >
          Agregar Gasto Fijo
        </Link>
      </div>
      <div className="space-y-6">
        <Card className="rounded-2xl shadow-sm border border-gray-100">
          <CardHeader>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Listado de Gastos
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  Total Mensual
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  ${totalMonthly.toFixed(2)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-700">
                    <th className="p-3 font-medium">Concepto</th>
                    <th className="p-3 font-medium">Categoría</th>
                    <th className="p-3 font-medium text-right">Monto</th>
                    <th className="p-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedCosts.map((cost) => (
                    <tr
                      key={cost.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors group ${
                        editingExpense?.id === cost.id ? "bg-blue-500/10" : ""
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-medium text-gray-900">
                          {cost.name}
                        </div>
                        {cost.description && (
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {cost.description}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {cost.category || "General"}
                        </span>
                      </td>
                      <td className="p-3 text-right text-blue-600 font-mono font-bold">
                        ${cost.amount.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <Link
                            href={`/expenses?edit=${cost.id}`}
                            className="text-sm px-3 py-1 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition opacity-80 group-hover:opacity-100 focus:opacity-100"
                          >
                            Editar
                          </Link>
                          <form action={deleteFixedCost.bind(null, cost.id)}>
                            <button className="text-sm px-3 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition opacity-80 group-hover:opacity-100 focus:opacity-100">
                              Borrar
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {fixedCosts.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-gray-500 italic"
                      >
                        No hay gastos fijos registrados. Agrega uno para
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
  );
}
