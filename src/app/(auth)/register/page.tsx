import { RegisterForm } from "@/components/AuthForms";
import { envs } from "@/config/envs";

const title = envs.NEXT_PUBLIC_APP_TITLE;
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-black p-4">
      <div className="max-w-md w-full space-y-8 bg-white/5 p-8 rounded-2xl backdrop-blur-sm border border-white/10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-600 mb-2">
            {title}
          </h1>
          <h2 className="mt-6 text-2xl font-bold text-white">Crear Cuenta</h2>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
