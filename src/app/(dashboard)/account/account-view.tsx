"use client";

import {
  Building2,
  Loader2,
  LogOut,
  Save,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { signOutAction } from "@/actions/auth";
import {
  deleteAccount,
  updateOrganization,
  updateProfile,
} from "@/actions/user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { authClient } from "@/lib/auth-client";

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
  const router = useRouter();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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

  async function handleDeleteAccount() {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      toast.success("Cuenta eliminada correctamente");
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login"); // redirect to login page
          },
        },
      });
    } catch {
      toast.error("Error al eliminar la cuenta");
      setIsDeletingAccount(false);
    }
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
              {/* Could add more org details here later */}
              <div className="p-4 rounded-lg bg-blue-50 text-blue-800 text-sm">
                <p className="font-medium">Plan Actual: Periodo de Prueba</p>
              </div>
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

      {/* Danger Zone */}
      <div className="space-y-6 md:col-span-2">
        <Card className="border-red-200 shadow-sm bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-xl text-red-900">
              Zona de Peligro
            </CardTitle>
            <CardDescription className="text-red-700/80">
              Advertencia: Las siguientes acciones son destructivas y no se
              pueden deshacer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-red-900">Eliminar Cuenta</h3>
                <p className="text-sm text-red-700/80 max-w-[600px]">
                  Eliminar permanentemente tu cuenta y todos los datos
                  asociados. Si eres el único miembro de una organización, esta
                  también será eliminada con todos sus productos.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isDeletingAccount}
                    className="whitespace-nowrap sm:w-auto w-full"
                  >
                    {isDeletingAccount ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Eliminar Cuenta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      ¿Estás absolutamente seguro?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará
                      permanentemente tu cuenta, tus datos personales, y si eres
                      el único miembro de una organización, también se
                      eliminarán todos los productos, ventas y datos de la
                      misma.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeletingAccount}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        void handleDeleteAccount();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={isDeletingAccount}
                    >
                      {isDeletingAccount ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Sí, eliminar mi cuenta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
