"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/sidebar-store";

interface NavItemProps {
  item: NavItem;
  isCollapsed: boolean;
  isMobile?: boolean;
}

export function NavItemComponent({
  item,
  isCollapsed,
  isMobile,
}: NavItemProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const closeSidebar = useSidebar((state) => state.closeSidebar);

  const isActive = pathname.startsWith(item.href);
  const hasSubmenu = item.quickActions && item.quickActions.length > 0;

  const handleClick = () => {
    if (hasSubmenu && !isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  useEffect(() => {
    if (isCollapsed) {
      setIsExpanded(false);
    }
  }, [isCollapsed]);

  return (
    <div className="relative">
      <div className="flex gap-1 items-center">
        <Tooltip delayDuration={500} disableHoverableContent>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              onClick={closeSidebar}
              className={cn(
                "flex grow items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-orange-50 text-orange-700 border-r-2 border-orange-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                isCollapsed && !isMobile && "justify-center px-1",
                isMobile && "w-full justify-start",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  isCollapsed && !isMobile ? "mr-0" : "mr-3",
                  isActive
                    ? "text-orange-900"
                    : "text-gray-400 group-hover:text-gray-600",
                )}
              />

              {(!isCollapsed || isMobile) && (
                <>
                  <span className="truncate">{item.name}</span>

                  {item.badge && (
                    <span className="ml-auto bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          </TooltipTrigger>
          {isCollapsed && !isMobile && (
            <TooltipContent
              side="right"
              className="text-white bg-black"
              sideOffset={5}
              arrowPadding={5}
              hideWhenDetached={true}
              popoverTargetAction="toggle"
            >
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-gray-200">{item.description}</p>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>

        {/* Desktop submenu toggle */}
        {hasSubmenu && !isMobile && !isCollapsed && (
          <button
            className="hover:bg-gray-50 p-2 rounded-lg"
            onClick={handleClick}
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 ml-auto transition-transform",
                isExpanded ? "rotate-180" : "",
              )}
            />
          </button>
        )}
      </div>

      {/* Quick Actions Submenu */}
      {hasSubmenu && isExpanded && !isMobile && (
        <div className="ml-6 mt-1 space-y-1">
          {item.quickActions!.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex items-center px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.name}
            </Link>
          ))}
        </div>
      )}

      {/* Mobile submenu */}
      {hasSubmenu && isMobile && (
        <div className="ml-8 mt-1 space-y-1">
          {item.quickActions!.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex items-center px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
