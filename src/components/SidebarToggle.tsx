"use client";

import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function SidebarToggle({
  isCollapsed,
  onToggle,
  className,
}: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className={`w-full flex items-center justify-center p-2 hover:bg-gray-100 transition-colors ${className}`}
      title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
    >
      <MenuIcon className="w-4 h-4" />
    </Button>
  );
}
