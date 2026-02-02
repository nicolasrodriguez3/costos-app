import { getUserInfo } from "@/actions/user";
import { auth } from "@/auth";
import { PageHeader } from "@/components/PageHeader";
import { AccountView } from "./account-view";

const breadcrumbs = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/account", label: "Mi cuenta" },
];

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  const data = await getUserInfo();

  if (!data) return null;

  const isOwner = data.membership?.role === "OWNER";

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
        }}
        organization={data.organizationDetails}
        isOwner={isOwner}
      />
    </div>
  );
}
