import { redirect } from "next/navigation";

import { getUserInfo } from "@/actions/user";
import { PageHeader } from "@/components/PageHeader";
import { AccountView } from "./account-view";

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/account", label: "Mi cuenta" },
];

export default async function AccountPage() {
  const data = await getUserInfo();

  if (!data) {
    redirect("/login");
  }

  const isOwner = data.members?.[0]?.role === "owner";

  return (
    <div className="min-h-screen p-8 space-y-8 bg-linear-to-br from-gray-50 to-white text-black">
      <PageHeader
        title="Mi cuenta"
        subtitle="Gestiona tu perfil y configuración de cuenta"
        backLink={{ href: "/dashboard", label: "Volver al Dashboard" }}
        gradient="blue"
        breadcrumbs={breadcrumbs}
      />

      <AccountView
        user={{
          name: data.name,
          email: data.email,
          image: data.image,
        }}
        organization={data.organizationDetails}
        isOwner={isOwner}
      />
    </div>
  );
}
