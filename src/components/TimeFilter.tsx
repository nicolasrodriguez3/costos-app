"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Period = "today" | "week" | "month" | "year" | "all";

const periods: { value: Period; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
  { value: "all", label: "Todo" },
];

export function TimeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = (searchParams.get("period") as Period) || "month";

  const handlePeriodChange = useCallback(
    (period: Period) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("period", period);
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => handlePeriodChange(period.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            currentPeriod === period.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
