import { RegisterForm } from "@/components/AuthForms";

export default function RegisterPage() {
  return (
    <div className="max-w-md w-full space-y-8 bg-white/5 p-8 rounded-2xl backdrop-blur-sm border border-white/10">
      <div className="text-center">
        <h2 className="py-4 text-2xl font-bold text-white">Crear Cuenta</h2>
      </div>
      <RegisterForm />
    </div>
  );
}
