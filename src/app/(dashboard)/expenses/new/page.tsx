import { getFixedCosts } from "@/actions/fixedCosts";
import { FixedCostForm } from "@/components/forms/FixedCostForm";
import { PageHeader } from "@/components/PageHeader";

interface PageProps {
  searchParams: Promise<{ edit?: string }>;
}

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/expenses", label: "Gastos Fijos" },
  { href: "/expenses/new", label: "Nuevo Gasto Fijo" },
];

export default async function ExpensesNewPage({ searchParams }: PageProps) {
  const { edit } = await searchParams;
  const fixedCosts = await getFixedCosts();

  const editingExpense = edit
    ? fixedCosts.find((cost) => cost.id === edit)
    : undefined;

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Gastos Fijos"
        gradient="blue"
        breadcrumbs={breadcrumbs}
        backLink={{ href: "/expenses", label: "Volver a Gastos Fijos" }}
      />

      <div className="max-w-4xl mx-auto mt-8">
        <FixedCostForm fixedCost={editingExpense} />
      </div>
    </div>
  );
}
