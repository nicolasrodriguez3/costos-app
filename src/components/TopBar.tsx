"use client";

import { ListIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { ReactNode } from "react";

import { toggleSidebarCookie } from "@/actions/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/sidebar-store";
import { SidebarToggle } from "./SidebarToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface TopBarProps {
  title: string;
  primaryAction?: ReactNode;
  user: {
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

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header
      className={cn(
        "fixed w-full top-0 z-50 bg-white border-b border-gray-200 shadow-sm",
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

        <Link
          href="/dashboard"
          className="text-lg font-semibold text-gray-800 hover:text-gray-900 truncate px-2"
        >
          {title}
        </Link>

        {user && (
          <Link
            href="/account"
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Avatar className="h-8 w-8">
              {user.image && <AvatarImage src={user.image} />}
              <AvatarFallback className="bg-linear-to-br from-orange-400 to-red-500 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
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

          <Link
            href={"/dashboard"}
            className="text-xl font-semibold text-gray-800 hover:text-gray-900"
          >
            {title}
          </Link>
        </div>

        <div className="flex items-center gap-4 px-2">
          {primaryAction && <div>{primaryAction}</div>}

          {user && (
            <Link
              href="/account"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Avatar className="h-10 w-10">
                {user.image && <AvatarImage src={user.image} />}
                <AvatarFallback className="bg-linear-to-br from-orange-400 to-red-500 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
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
