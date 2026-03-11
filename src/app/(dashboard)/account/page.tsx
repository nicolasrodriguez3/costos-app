import { redirect } from "next/navigation";

import { getUserInfo } from "@/actions/user";
import { PageHeader } from "@/components/PageHeader";
import { LogOutButton } from "@/components/ui/log-out-button";
import { ROLES } from "@/config/roles";
import { AccountView } from "./account-view";

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/account", label: "Mi cuenta" },
];

export const metadata = {
  title: "Mi cuenta",
};

export default async function AccountPage() {
  const data = await getUserInfo();

  if (!data) {
    redirect("/login");
  }

  const isOwner = data.members?.[0]?.role === ROLES.OWNER;

  return (
    <div className="max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
      <PageHeader
        title="Mi cuenta"
        subtitle="Gestiona tu perfil y configuración de cuenta"
        gradient="blue"
        breadcrumbs={breadcrumbs}
        actions={<LogOutButton />}
      />

      <AccountView
        user={{
          name: data.name,
          email: data.email,
          image: data.image,
        }}
        organization={data.membership}
        isOwner={isOwner}
      />
    </div>
  );
}
