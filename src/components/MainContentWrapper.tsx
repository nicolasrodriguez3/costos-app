"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/sidebar-store";

interface MainContentWrapperProps {
  children: React.ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const isCollapsed = useSidebar((state) => state.isCollapsed);

  // Use responsive utility classes (md:) to apply margins only on desktop.
  // On mobile (default), margin is 0 (implied).
  const marginClass = isCollapsed ? "md:ml-16" : "md:ml-64";

  return (
    <div
      className={cn(
        "w-full flex flex-col transition-all duration-300 ease-in-out",
        marginClass,
      )}
    >
      {children}
    </div>
  );
}
