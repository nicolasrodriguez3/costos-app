"use server";

import { prisma } from "@/lib/prisma";

export const getActiveOrganization = async (userId: string) => {
  const member = await prisma.member.findFirst({
    where: {
      userId,
    },
  });

  if (!member) return null;

  const organization = await prisma.organization.findFirst({
    where: {
      id: member.organizationId,
    },
  });

  return organization;
};

export const getOrganizationDetails = async (organizationId: string) => {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  return organization;
};
