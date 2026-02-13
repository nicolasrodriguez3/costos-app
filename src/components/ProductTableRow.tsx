"use client";

import { DotsThreeIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { deleteProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import type { RecipeItem } from "@/types";

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    type: string;
    basePrice: number;
    cost: number;
    receipeItems?: RecipeItem[];
  };
}

export const ProductTableRow = ({ product }: Props) => {
  const { id, name, slug, type, basePrice, cost, receipeItems } = product;

  const margin = basePrice - cost;
  const marginPercent = basePrice > 0 ? (margin / basePrice) * 100 : 0;

  return (
    <TableRow className="hover:bg-gray-50 border-b border-gray-100">
      <TableCell className="font-medium text-gray-700 flex items-center">
        <Link href={`/products/${slug}`} className="hover:underline">
          {name}
        </Link>
        {receipeItems && receipeItems.length > 0 && (
          <span className="ml-2 text-xs text-gray-50 bg-gray-800 px-1 py-0.5 rounded whitespace-nowrap">
            {receipeItems.length} ingr.
          </span>
        )}
      </TableCell>
      <TableCell className="text-gray-600 text-sm">{type}</TableCell>
      <TableCell className="text-right text-gray-600">
        ${basePrice.toFixed(2)}
      </TableCell>
      <TableCell className="text-right text-red-400 font-mono">
        ${cost.toFixed(2)}
      </TableCell>
      <TableCell className="text-right font-mono">
        <div className={margin > 0 ? "text-green-400" : "text-red-500"}>
          ${margin.toFixed(2)}
        </div>
        <div className="text-xs text-gray-600">{marginPercent.toFixed(0)}%</div>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsThreeIcon
                size={24}
                weight="bold"
                className="text-gray-400"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/products?edit=${id}`}
                scroll={false}
                className="w-full flex items-center gap-2 cursor-pointer"
              >
                <DotsThreeIcon size={16} />
                Editar
              </Link>
            </DropdownMenuItem>
            <form action={deleteProduct.bind(null, id)}>
              <DropdownMenuItem asChild>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 text-red-600 cursor-pointer"
                >
                  <TrashSimpleIcon size={16} />
                  Borrar
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
