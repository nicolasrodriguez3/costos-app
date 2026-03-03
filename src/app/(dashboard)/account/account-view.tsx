"use client";

import {
  Building2,
  Loader2,
  LogOut,
  Save,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { signOutAction } from "@/actions/auth";
import { updateOrganization, updateProfile } from "@/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AccountViewProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  organization: {
    name: string;
  } | null;
  isOwner: boolean;
}

export function AccountView({ user, organization, isOwner }: AccountViewProps) {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);

  // Helper to get initials
  const initials = user.name
    ? user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "U";

  async function onUpdateProfile(formData: FormData) {
    setIsUpdatingProfile(true);
    try {
      await updateProfile(formData);
      toast.success("Perfil actualizado correctamente");
    } catch {
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  async function onUpdateOrg(formData: FormData) {
    setIsUpdatingOrg(true);
    try {
      await updateOrganization(formData);
      toast.success("Organización actualizada correctamente");
    } catch {
      toast.error("Error al actualizar la organización");
    } finally {
      setIsUpdatingOrg(false);
    }
  }

  async function handleSignOut() {
    setIsClosingSession(true);
    await signOutAction();
    setIsClosingSession(false);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Profile Section */}
      <div className="space-y-6">
        <Card className="border-gray-500/10 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user.image && <AvatarImage src={user.image} />}
                <AvatarFallback className="bg-gray-500/10 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tus datos personales
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <form action={onUpdateProfile}>
            <CardContent className="space-y-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name || ""}
                    className="pl-9"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  El email no se puede cambiar.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Sign Out Section */}
        <Card className="border-gray-500/10 shadow-sm bg-red-50/50">
          <CardContent className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-900">Cerrar Sesión</h3>
              <p className="text-sm text-red-700/80">
                Finalizar tu sesión actual de forma segura.
              </p>
            </div>
            <form>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                size="sm"
                className="cursor-pointer"
                disabled={isClosingSession}
              >
                {isClosingSession ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Salir
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Organization Section */}
      <div className="space-y-6">
        <Card className="border-gray-500/10 shadow-sm h-full">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl">Organización</CardTitle>
                <CardDescription>
                  Gestiona los datos de tu negocio
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <form action={onUpdateOrg}>
            <CardContent className="space-y-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nombre del Negocio</Label>
                <Input
                  id="orgName"
                  name="name"
                  defaultValue={organization?.name || ""}
                  disabled={!isOwner}
                />
                {!isOwner && (
                  <p className="text-xs text-amber-600">
                    Solo el propietario puede editar estos detalles.
                  </p>
                )}
              </div>
              {/* Could add more org details here later */}
              <div className="p-4 rounded-lg bg-blue-50 text-blue-800 text-sm">
                <p className="font-medium">Plan Actual: Básico</p>
              </div>
            </CardContent>
            {isOwner && (
              <CardFooter>
                <Button
                  type="submit"
                  disabled={isUpdatingOrg}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {isUpdatingOrg ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Actualizar Negocio
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
