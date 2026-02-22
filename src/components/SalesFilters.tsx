"use client";

import { Calendar, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SalesFiltersProps = {
  initialStartDate?: string;
  initialEndDate?: string;
  initialSearch?: string;
};

export function SalesFilters({
  initialStartDate = "",
  initialEndDate = "",
  initialSearch = "",
}: SalesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [search, setSearch] = useState(initialSearch);

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (startDate) {
      params.set("startDate", startDate);
    } else {
      params.delete("startDate");
    }

    if (endDate) {
      params.set("endDate", endDate);
    } else {
      params.delete("endDate");
    }

    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }

    // Remove cursor when filters change
    params.delete("cursor");

    startTransition(() => {
      router.push(`/sales/history?${params.toString()}`);
    });
  }, [startDate, endDate, search, searchParams, router]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearch("");
    startTransition(() => {
      router.push("/sales/history");
    });
  };

  const hasFilters = startDate || endDate || search;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
      <div className="flex items-center gap-2 text-gray-700 font-medium">
        <Calendar size={18} />
        <span>Filtros</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date range */}
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-sm text-gray-600">
            Desde
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-50 border-gray-200"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="endDate" className="text-sm text-gray-600">
            Hasta
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-50 border-gray-200"
          />
        </div>

        {/* Search */}
        <div className="space-y-1.5">
          <Label htmlFor="search" className="text-sm text-gray-600">
            Buscar producto
          </Label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              id="search"
              type="text"
              placeholder="Nombre del producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-end gap-2">
          <Button
            onClick={updateFilters}
            disabled={isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isPending ? "Buscando..." : "Aplicar"}
          </Button>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={isPending}
              className="px-3"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
