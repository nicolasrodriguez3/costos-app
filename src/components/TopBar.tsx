"use client";

import { ListIcon } from "@phosphor-icons/react";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { toggleSidebarCookie } from "@/actions/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/sidebar-store";
import { SidebarToggle } from "./SidebarToggle";

interface TopBarProps {
  title: string;
  primaryAction?: ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  className?: string;
}

export function TopBar({ title, primaryAction, user, className }: TopBarProps) {
  const isMobileOpen = useSidebar((state) => state.isOpen);
  const openSidebar = useSidebar((state) => state.openSidebar);
  const closeSidebar = useSidebar((state) => state.closeSidebar);
  const isCollapsed = useSidebar((state) => state.isCollapsed);
  const toggleCollapseStore = useSidebar((state) => state.toggleCollapse);

  const handleToggleCollapse = async () => {
    toggleCollapseStore();
    await toggleSidebarCookie(!isCollapsed);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm",
        className,
      )}
    >
      {/* Mobile Layout */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 h-15">
        <Button
          variant="ghost"
          size="icon"
          onClick={isMobileOpen ? closeSidebar : openSidebar}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          type="button"
          aria-label="Abrir menú"
        >
          <ListIcon size={24} weight="bold" />
        </Button>

        <h1 className="text-lg font-semibold text-gray-800 truncate px-2">
          {title}
        </h1>

        {user && (
          <Link
            href="/account"
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-red-500 text-white">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Usuario"}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User size={16} />
              )}
            </div>
          </Link>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between px-2 h-20">
        {/* Toggle colapsed sidebar */}
        <div className="flex items-center gap-2">
          <div className="flex p-2 items-center justify-center">
            <SidebarToggle
              isCollapsed={isCollapsed}
              onToggle={handleToggleCollapse}
            />
          </div>

          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>

        <div className="flex items-center gap-4 px-2">
          {primaryAction && <div>{primaryAction}</div>}

          {user && (
            <Link
              href="/account"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-red-500 text-white">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "Usuario"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                  {user.name || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                  {user.email}
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
