"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/serverSession";

export async function getUserInfo() {
  const { session } = await getServerSession();

  const userData = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    include: { members: { include: { organization: true } } },
  });

  if (!userData) return null;

  const organization = await prisma.organization.findUnique({
    where: {
      id: session.activeOrganizationId || "",
    },
  });

  return {
    ...userData,
    // Warning: this membership logic might still be flawed if user has multiple memberships,
    // taking the first one [0] might not match activeOrganizationId.
    // But fixing that requires filtering `userData.members`.
    membership:
      userData.members.find(
        (m) => m.organizationId === session.activeOrganizationId,
      )?.organization || userData.members[0]?.organization,
    organizationDetails: organization,
  };
}

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;

  if (!name || name.length < 2) {
    throw new Error("Invalid name");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  revalidatePath("/account");
}

export async function updateOrganization(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const orgId = session?.session?.activeOrganizationId;

  if (!session?.user?.id || !orgId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;

  if (!name || name.length < 2) {
    throw new Error("Invalid organization name");
  }

  // Verify ownership
  const membership = await prisma.member.findFirst({
    where: {
      organizationId: orgId,
      userId: session.user.id,
    },
  });

  if (membership?.role !== "OWNER") {
    throw new Error("Only owners can update organization details");
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: { name },
  });

  revalidatePath("/account");
}
