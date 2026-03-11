"use server";

import { prisma } from "@/lib/prisma";

export const getActiveOrganization = async (userId: string) => {
  const member = await prisma.member.findFirst({
    where: { userId },
    select: {
      organization: {
        select: { id: true },
      },
    },
  });

  return member?.organization ?? null;
};

export const getOrganizationDetails = async (organizationId: string) => {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  return organization;
};
