"use server";

import { z } from "zod/v4";

import { envs } from "@/config/envs";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const WaitlistSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.email("Por favor ingresa un email válido"),
});

export type WaitlistState = {
  success: boolean;
  message: string;
  name?: string;
  errors?: {
    name?: string[];
    email?: string[];
  };
};

const title = envs().NEXT_PUBLIC_APP_TITLE;
export async function subscribeToWaitlist(
  formData: FormData,
): Promise<WaitlistState> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
  };

  const validatedFields = WaitlistSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Por favor corrige los errores del formulario",
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  const { name, email } = validatedFields.data;

  try {
    // Check if email already exists
    const existingSubscriber = await prisma.waitlistSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      return {
        success: true,
        message: "¡Ya estás en nuestra lista! Te avisaremos cuando lancemos.",
      };
    }

    // Create new subscriber
    await prisma.waitlistSubscriber.create({
      data: {
        name,
        email,
      },
    });

    return {
      success: true,
      message: `¡Genial! Te avisaremos cuando ${title} esté disponible.`,
    };
  } catch (error) {
    logger.error("subscribeToWaitlist", error);
    return {
      success: false,
      message: "Ocurrió un error. Por favor intenta de nuevo.",
    };
  }
}
