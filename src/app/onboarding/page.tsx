import { UtensilsCrossed } from "lucide-react";

import { CreateOrgForm } from "@/components/forms/CreateOrganizationForm";
import { JoinOrgForm } from "@/components/forms/JoinOrganizationForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clientEnv } from "@/config/env";

export default function OnboardingPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-orange-50 via-white to-red-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-red-200/30 blur-3xl" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-red-500 shadow-lg">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Bienvenido a{" "}
            <span className="bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              {clientEnv.NEXT_PUBLIC_APP_TITLE}
            </span>
          </CardTitle>
          <CardDescription className="text-base">
            Gestioná los costos de tu negocio gastronómico. Creá una
            organización o unite a una existente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Crear Nueva</TabsTrigger>
              <TabsTrigger value="join">Unirme</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <CreateOrgForm />
            </TabsContent>

            <TabsContent value="join">
              <JoinOrgForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
