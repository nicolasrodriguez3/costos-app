import Link from "next/link";
import { ReactNode } from "react";

import { fontTitle } from "@/config/fonts";
import { Breadcrumbs } from "./Breadcrumbs";

type GradientPreset = "orange" | "purple" | "green" | "blue";

interface PageHeaderProps {
  title: string | ReactNode;
  subtitle?: string;
  gradient?: GradientPreset;
  backLink?: {
    href: string;
    label: string;
  };
  actions?: ReactNode;
  breadcrumbs?: { href: string; label: string }[];
}

const gradientStyles: Record<GradientPreset, string> = {
  orange: "from-orange-400 to-red-600",
  purple: "from-purple-400 to-indigo-600",
  green: "from-green-400 to-emerald-600",
  blue: "from-blue-400 to-cyan-600",
};

export function PageHeader({
  title,
  subtitle,
  gradient = "orange",
  backLink,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <header className="max-w-7xl mx-auto">
      {breadcrumbs && (
        <div className="mb-4">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      )}
      <div className="flex justify-between items-center flex-wrap mb-12 gap-4">
        <div>
          <h1
            className={`${fontTitle.className} pb-1 text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r ${gradientStyles[gradient]}`}
          >
            {title}
          </h1>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {actions}
          {backLink && (
            <Link
              href={backLink.href}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition text-sm"
            >
              {backLink.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
