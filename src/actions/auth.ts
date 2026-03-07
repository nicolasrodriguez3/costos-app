"use server";

import { APIError } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { AUTH_CONFIG } from "@/config/auth.config";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

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
export async function authenticate(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      logger.error("authenticate", error);
      switch (error.status) {
        case "BAD_REQUEST":
        case "UNAUTHORIZED":
          return "Correo electrónico o contraseña inválidos.";
        default:
          return error.message;
      }
    }
    logger.error("authenticate", error);
    return "Algo salió mal al iniciar sesión.";
  }
  redirect("/dashboard");
}

/**
 * Server Action to register a new user and create their organization.
 */
export async function register(formData: FormData): Promise<RegisterState> {
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
    const result = await auth.api.signUpEmail({
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
  } catch (error) {
    if (error instanceof APIError) {
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
    logger.error("register", error);
    return { message: "Error de servidor: No se pudo completar el registro." };
  }

  redirect("/onboarding");
}

/**
 * Server Action to sign out the current user.
 */
export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    logger.error("signOutAction", error);
  }
  redirect("/login");
}
