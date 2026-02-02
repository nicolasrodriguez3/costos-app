import type { Metadata } from "next";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import "@/app/globals.css";

import { auth } from "@/auth";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { envs } from "@/config/envs";
import { SidebarProvider } from "@/store/sidebar-store";

export const metadata: Metadata = {
  title: envs.NEXT_PUBLIC_APP_TITLE,
  description:
    "Gestiona tus ingredientes, recetas y ventas de pizzas en tiempo real.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const defaultCollapsed =
    cookieStore.get("sidebar:collapsed")?.value === "true";

  const appTitle = envs.NEXT_PUBLIC_APP_TITLE;

  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed}>
      <TopBar title={appTitle} user={session?.user} />
      <div className="relative flex min-h-screen bg-gray-50">
        <Sidebar user={session?.user} />
        <MainContentWrapper>
          <main className="flex-1">{children}</main>
        </MainContentWrapper>
      </div>
    </SidebarProvider>
  );
}
