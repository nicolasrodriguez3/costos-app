"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/serverSession";

export async function getUserInfo() {
  const sessionData = await getServerSession();

  if (!sessionData) return null;

  const { session } = sessionData;

  const userData = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    include: { members: { include: { organization: true } } },
  });

  if (!userData) return null;

  return {
    ...userData,
    // Warning: this membership logic might still be flawed if user has multiple memberships,
    // taking the first one [0] might not match activeOrganizationId.
    // But fixing that requires filtering `userData.members`.
    membership:
      userData.members.find(
        (m) => m.organizationId === session.activeOrganizationId,
      )?.organization || userData.members[0]?.organization,
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

export async function deleteAccount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Find all organizations where the user is a member
  const memberships = await prisma.member.findMany({
    where: { userId },
  });

  for (const membership of memberships) {
    const orgId = membership.organizationId;

    // Check total members in this organization
    const memberCount = await prisma.member.count({
      where: { organizationId: orgId },
    });

    // If the user is the only member, delete the organization
    if (memberCount === 1) {
      // Clean up relations that have onDelete: Restrict to prevent P2003 errors
      await prisma.recipeItem.deleteMany({
        where: { product: { organizationId: orgId } },
      });

      await prisma.saleItem.deleteMany({
        where: { sale: { organizationId: orgId } },
      });

      await prisma.organization.delete({
        where: { id: orgId },
      });
    }
  }

  // Clean up remaining restricted relations tied to the user's creations
  await prisma.recipeItem.deleteMany({
    where: {
      OR: [
        { product: { userId } },
        { ingredient: { userId } },
        { subProduct: { userId } },
      ],
    },
  });

  await prisma.saleItem.deleteMany({
    where: {
      OR: [{ sale: { userId } }, { product: { userId } }],
    },
  });

  // Delete the user
  // This will cascade delete sessions, accounts, and other related models
  // without an explicit organizationId linkage
  await prisma.user.delete({
    where: { id: userId },
  });
  
  logger.info("User deleted", userId);
  revalidatePath("/");
}
