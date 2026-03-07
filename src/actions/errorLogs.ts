"use server";

import { revalidatePath } from "next/cache";

import { PAGINATION } from "@/config/pagination";
import { Prisma } from "@/generated/prisma/client";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { requireSuperUser } from "@/lib/serverSession";

export type ErrorLogFilterParams = {
  startDate?: string;
  endDate?: string;
  level?: string;
  action?: string;
  cursor?: string;
  limit?: number;
};

export async function getErrorLogs(params: ErrorLogFilterParams) {
  // Ensure the user is a superuser
  await requireSuperUser();

  const {
    startDate,
    endDate,
    level,
    action,
    cursor,
    limit = PAGINATION.salesHistoryPerPage || 20, // Reuse existing limit or default 20
  } = params;

  // Build where clause. Superusers can see all logs.
  const where: Prisma.ErrorLogWhereInput = {};

  if (level) where.level = level;
  if (action) where.action = { contains: action, mode: "insensitive" };

  if (startDate || endDate) {
    const timestampFilter: Prisma.DateTimeFilter = {};
    if (startDate) timestampFilter.gte = new Date(startDate);
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      timestampFilter.lte = endOfDay;
    }
    where.timestamp = timestampFilter;
  }

  const totalCount = await prisma.errorLog.count({ where });

  const logs = await prisma.errorLog.findMany({
    where,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { timestamp: "desc" },
  });

  const hasMore = logs.length > limit;
  const resultLogs = hasMore ? logs.slice(0, limit) : logs;

  return {
    logs: resultLogs,
    hasMore,
    totalCount,
  };
}

export async function clearOldErrorLogs(daysOld = 30) {
  // Ensure the user is a superuser
  await requireSuperUser();

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysOld);

  try {
    const result = await prisma.errorLog.deleteMany({
      where: {
        timestamp: { lt: dateThreshold },
      },
    });

    revalidatePath("/admin/error-logs");
    return {
      success: true,
      message: `Se eliminaron ${result.count} logs antiguos.`,
    };
  } catch (error) {
    logger.error("clearOldErrorLogs", error);
    return { success: false, message: "Error al limpiar los logs antiguos." };
  }
}
