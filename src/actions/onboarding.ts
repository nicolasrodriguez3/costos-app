"use server";

import { APIError } from "better-auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { seedInitialData } from "@/lib/seed";

const JoinOrganizationSchema = z.object({
  organizationId: z.string().min(1, "El ID de la organización es requerido"),
});

export type JoinState = {
  error?: string;
  success?: boolean;
};

const CreateOrganizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres"),
  includeSampleData: z.boolean().default(true),
});

export async function createOrganizationAction(
  prevState: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const includeSampleData = formData.get("includeSampleData") === "true";

  const validatedFields = CreateOrganizationSchema.safeParse({
    name,
    slug,
    includeSampleData,
  });

  if (!validatedFields.success) {
    return {
      error:
        "Datos inválidos: " +
        JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "No se ha iniciado sesión" };
    }

    const org = await auth.api.createOrganization({
      body: {
        name,
        slug,
        userId: session.user.id,
      },
      headers: await headers(),
    });

    if (!org) {
      throw new Error("Error al crear la organización");
    }

    // Set as active is handled automatically by createOrganization?
    // Usually better-auth creates it and adds user as owner.
    // We might want to ensure it is active.

    await auth.api.setActiveOrganization({
      body: {
        organizationId: org.id,
      },
      headers: await headers(),
    });

    if (includeSampleData) {
      await seedInitialData(org.id, session.user.id);
    }
  } catch (error) {
    console.error("Failed to create organization:", error);
    if (error instanceof APIError) {
      return { error: error.message || "Error al crear la organización" };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al crear la organización" };
  }

  revalidatePath("/");
  redirect("/dashboard");
}

export async function joinOrganizationAction(
  prevState: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const organizationId = formData.get("organizationId") as string;

  const validatedFields = JoinOrganizationSchema.safeParse({
    organizationId,
  });

  if (!validatedFields.success) {
    return {
      error: "ID de organización inválido",
    };
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "No se ha iniciado sesión" };
    }

    await auth.api.addMember({
      body: {
        organizationId,
        userId: session.user.id,
        role: "member",
      },
    });

    // Set as active organization
    await auth.api.setActiveOrganization({
      body: {
        organizationId,
      },
      headers: await headers(), // This IS needed to set the cookie for the user
    });
  } catch (error) {
    console.error("Failed to join organization:", error);
    if (error instanceof APIError) {
      return { error: error.message || "Error al unirse a la organización" };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al unirse a la organización" };
  }

  revalidatePath("/");
  redirect("/dashboard");
}
