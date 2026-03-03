import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { deleteFixedCost, getFixedCosts } from "@/actions/fixedCosts";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        actions={
          <Button asChild variant="ghost">
            <Link
              href="/expenses/new"
              className=" bg-blue-500/10 text-blue-600 hover:text-blue-700 hover:bg-blue-500/20 transition"
            >
              <PlusIcon className="mr-1 size-4" />
              Agregar Gasto Fijo
            </Link>
          </Button>
        }
      />

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
            <Table className="text-left border-collapse hover:bg-transparent">
              <TableHeader>
                <TableRow className="border-b border-gray-100 text-gray-700">
                  <TableHead className="p-3 font-medium">Concepto</TableHead>
                  <TableHead className="p-3 font-medium">Categoría</TableHead>
                  <TableHead className="p-3 font-medium text-right">
                    Monto
                  </TableHead>
                  <TableHead className="p-3 font-medium text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixedCosts.map((cost) => (
                  <TableRow
                    key={cost.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors group ${editingExpense?.id === cost.id ? "bg-blue-500/10" : ""
                      }`}
                  >
                    <TableCell className="p-3">
                      <div className="font-medium text-gray-900">
                        {cost.name}
                      </div>
                      {cost.description && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {cost.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {cost.category || "General"}
                      </span>
                    </TableCell>
                    <TableCell className="p-3 text-right text-blue-600 font-mono font-bold">
                      ${cost.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      {/* <Button asChild variant="ghost" size="icon" className="size-8 text-gray-500 hover:text-orange-600">
                          <Link
                            href={`/expenses/${cost.id}/edit`}
                            aria-label="Editar"
                          >
                            <PencilIcon size={16} />
                          </Link>
                        </Button> */}
                      <DeleteModal
                        id={cost.id}
                        name={cost.name}
                        type="gasto"
                        action={deleteFixedCost}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {fixedCosts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="p-8 text-center text-gray-500 italic"
                    >
                      No hay gastos fijos registrados. Agrega uno para
                      comenzar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
