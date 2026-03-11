import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

// biome-ignore lint/style/useNamingConvention: required by nextjs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");

  await auth.api.setActiveOrganization({
    headers: await headers(),
    body: { organizationId },
  });

  redirect("/dashboard");
}
