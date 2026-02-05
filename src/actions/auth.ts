"use server";

import { APIError } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { AUTH_CONFIG } from "@/config/auth.config";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.email({
    message: "Por favor, ingrese un correo electrónico válido.",
  }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export type RegisterState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string;
};

/**
 * Server Action to authenticate a user.
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await authConfig.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      console.error("APIERROR:", error);
      switch (error.status) {
        case "BAD_REQUEST":
        case "UNAUTHORIZED":
          return "Correo electrónico o contraseña inválidos.";
        default:
          return error.message;
      }
    }
    // Next.js redirect throws a specific error that should not be caught
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Authentication error:", error);
    return "Algo salió mal al iniciar sesión.";
  }
  redirect("/dashboard");
}

/**
 * Server Action to register a new user and create their organization.
 */
export async function register(
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campos faltantes. No se pudo registrar el usuario.",
    };
  }

  const { email, password, name } = validatedFields.data;

  try {
    // 1. Create user with BetterAuth (auto-signs in by default if configured)
    const result = await authConfig.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: await headers(),
    });
    if (!result || !result.user) {
      return { message: "Error al registrar usuario." };
    }

    const userId = result.user.id;

    await createOrganizationAndAddUser(userId, name);

    await authConfig.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      console.log("APIERROR:", error.body);
      switch (error.body?.code) {
        case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
          return { message: "El correo electrónico ya está registrado." };
        case "PASSWORD_TOO_SHORT":
          return {
            message: `La contraseña es muy corta. Mínimo ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} caracteres.`,
          };
        case "PASSWORD_TOO_LONG":
          return {
            message: `La contraseña es muy larga. Máximo ${AUTH_CONFIG.MAX_PASSWORD_LENGTH} caracteres.`,
          };
        default:
          return { message: error.message };
      }
    }
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Failed to create user/organization:", error);
    return { message: "Error de servidor: No se pudo completar el registro." };
  }

  redirect("/dashboard");
}

/**
 * Server Action to sign out the current user.
 */
export async function signOutAction() {
  try {
    await authConfig.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Sign out error:", error);
  }
  redirect("/login");
}

export async function createOrganizationAndAddUser(
  userId: string,
  name?: string,
) {
  try {
    const orgName = name ? `Empresa de ${name}` : "Mi Empresa";

    return await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: { organizationId: org.id },
      });
      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: userId,
          role: "OWNER",
        },
      });
    });
  } catch (error) {
    console.error("Failed to create organization and add user:", error);
    throw error;
  }
}
