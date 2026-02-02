"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useIsMobile } from "@/hooks/use-mobile";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/sidebar-store";
import { NavItemComponent } from "./NavItem";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const isMobileOpen = useSidebar((state) => state.isOpen);
  const isCollapsed = useSidebar((state) => state.isCollapsed);
  const closeSidebar = useSidebar((state) => state.closeSidebar);

  const isMobile = useIsMobile();
  useBodyScrollLock(isMobile && isMobileOpen);

  const sidebarWidth = isCollapsed ? "md:w-16" : "md:w-64";
  const sidebarClasses = cn(
    "fixed left-0 top-20 bottom-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
    // Mobile Styles (max-md)
    "max-md:w-64 max-md:shadow-lg max-md:top-15",
    isMobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
    // Desktop Styles
    "md:translate-x-0",
    sidebarWidth,
    className,
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-xs"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        {/* Navigation */}
        <TooltipProvider>
          <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
            {navigationItems.map((item) => (
              <NavItemComponent
                key={item.name}
                item={item}
                isCollapsed={isCollapsed}
                isMobile={isMobile}
              />
            ))}
          </nav>
        </TooltipProvider>

        {/* Footer */}
        {/* <div className="p-3 py-4 border-t border-gray-200"></div> */}
      </div>
    </>
  );
}
