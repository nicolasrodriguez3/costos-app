import type { Metadata } from "next";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import "@/app/globals.css";

import {
  getActiveOrganization,
  getOrganizationDetails,
} from "@/actions/organization";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { env } from "@/config/env";
import { getServerSession } from "@/lib/serverSession";
import { SidebarProvider } from "@/store/sidebar-store";

export const metadata: Metadata = {
  title: {
    template: `%s | ${env.NEXT_PUBLIC_APP_TITLE}`,
    default: `Dashboard | ${env.NEXT_PUBLIC_APP_TITLE}`,
  },
  description:
    "Gestiona tus ingredientes, recetas y ventas de pizzas en tiempo real.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionData = await getServerSession();

  if (!sessionData?.session) {
    redirect("/login");
  }

  const { session, user } = sessionData;

  if (!session.activeOrganizationId) {
    const lastActiveOrg = await getActiveOrganization(session.userId);

    if (lastActiveOrg) {
      redirect(`/api/auth/set-active-org?organizationId=${lastActiveOrg.id}`);
    } else {
      redirect("/onboarding");
    }
  }

  const cookieStore = await cookies();
  const defaultCollapsed =
    cookieStore.get("sidebar:collapsed")?.value === "true";

  const organization = await getOrganizationDetails(
    session.activeOrganizationId,
  );
  const appTitle = env.NEXT_PUBLIC_APP_TITLE;

  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed}>
      <TopBar title={organization?.name || appTitle} user={user} />
      <main className="relative flex min-h-screen bg-gray-50 w-full">
        <Sidebar />
        <MainContentWrapper>{children}</MainContentWrapper>
      </main>
    </SidebarProvider>
  );
}
