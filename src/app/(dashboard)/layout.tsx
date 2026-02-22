import type { Metadata } from "next";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import "@/app/globals.css";

import { MainContentWrapper } from "@/components/MainContentWrapper";
import { SetActiveOrganization } from "@/components/SetActiveOrganization";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { envs } from "@/config/envs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/serverSession";
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
  const { session, user } = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.activeOrganizationId) {
    const lastActiveOrg = await prisma.member.findFirst({
      where: {
        userId: session.userId,
      },
      select: {
        organizationId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (lastActiveOrg) {
      return (
        <SetActiveOrganization organizationId={lastActiveOrg.organizationId} />
      );
    } else {
      redirect("/onboarding");
    }
  }

  const cookieStore = await cookies();
  const defaultCollapsed =
    cookieStore.get("sidebar:collapsed")?.value === "true";

  const appTitle = envs.NEXT_PUBLIC_APP_TITLE;

  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed}>
      <TopBar title={appTitle} user={user} />
      <div className="relative flex min-h-screen bg-gray-50 w-full">
        <Sidebar />
        <MainContentWrapper>{children}</MainContentWrapper>
      </div>
    </SidebarProvider>
  );
}
