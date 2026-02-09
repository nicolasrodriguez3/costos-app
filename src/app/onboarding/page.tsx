import { CreateOrgForm } from "@/components/forms/create-org-form";
import { JoinOrgForm } from "@/components/forms/join-org-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bienvenido</CardTitle>
          <CardDescription>
            Para comenzar, necesitas unirte a una organización o crear una
            nueva.
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
