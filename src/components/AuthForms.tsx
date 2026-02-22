"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authenticate, register } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { envs } from "@/config/envs";
import { SignInSocialButton } from "./SignInSocialButton";

const isAppReady = envs.NEXT_PUBLIC_APP_LAUNCHED;

// Validation schemas
const LoginSchema = z.object({
  email: z.email({
    message: "Por favor, ingrese un correo electrónico válido.",
  }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

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

type LoginFormData = z.infer<typeof LoginSchema>;
type RegisterFormData = z.infer<typeof RegisterSchema>;

export function LoginForm() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await authenticate(formData);
      if (result) {
        setErrorMessage(result);
      }
    });
  };

  return (
    <div>
      <div>
        <SignInSocialButton provider="google" disabled={!isAppReady} />
        <div className="relative my-4">
          <div className="relative flex justify-center items-center text-xs uppercase">
            <span className="w-full border-t border-white/10" />
            <span className="px-2 text-white">O</span>
            <span className="w-full border-t border-white/10" />
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            className="block mb-1 text-sm font-medium text-gray-300"
            htmlFor="email"
          >
            Email
          </label>
          <input
            {...registerField("email")}
            className="px-4 py-2 w-full text-white rounded-lg border outline-none bg-white/5 border-white/10 focus:ring-2 focus:ring-orange-500"
            id="email"
            type="email"
            placeholder="tu@correo.com.ar"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label
            className="block mb-1 text-sm font-medium text-gray-300"
            htmlFor="password"
          >
            Contraseña
          </label>
          <input
            {...registerField("password")}
            className="px-4 py-2 w-full text-white rounded-lg border outline-none bg-white/5 border-white/10 focus:ring-2 focus:ring-orange-500"
            id="password"
            type="password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <Link
              href="/register"
              className="font-medium text-orange-400 hover:text-orange-300"
            >
              ¿No tienes una cuenta? Regístrate
            </Link>
          </div>
        </div>
        <div>
          <Button
            type="submit"
            variant="default"
            className="cursor-pointer justify-center w-full text-white bg-orange-600 hover:bg-orange-700"
            disabled={isPending || !isAppReady}
          >
            {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </div>
        {errorMessage && (
          <div
            className="flex items-end space-x-1 h-8"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="text-sm text-red-500">{errorMessage}</p>
          </div>
        )}
      </form>
    </div>
  );
}

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await register(formData);
      if (result.message || result.errors) {
        setServerError(result.message);
      }
    });
  };

  return (
    <div>
      <div>
        <SignInSocialButton provider="google" signUp disabled={!isAppReady} />
        <div className="relative my-4">
          <div className="relative flex justify-center items-center text-xs uppercase">
            <span className="w-full border-t border-white/10" />
            <span className="px-2 text-white">O</span>
            <span className="w-full border-t border-white/10" />
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            className="block mb-1 text-sm font-medium text-gray-300"
            htmlFor="name"
          >
            Nombre
          </label>
          <input
            {...registerField("name")}
            className="px-4 py-2 w-full text-white rounded-lg border outline-none bg-white/5 border-white/10 focus:ring-2 focus:ring-orange-500"
            id="name"
            type="text"
            placeholder="Tu nombre"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label
            className="block mb-1 text-sm font-medium text-gray-300"
            htmlFor="email"
          >
            Email
          </label>
          <input
            {...registerField("email")}
            className="px-4 py-2 w-full text-white rounded-lg border outline-none bg-white/5 border-white/10 focus:ring-2 focus:ring-orange-500"
            id="email"
            type="email"
            placeholder="tu@correo.com.ar"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label
            className="block mb-1 text-sm font-medium text-gray-300"
            htmlFor="password"
          >
            Contraseña
          </label>
          <input
            {...registerField("password")}
            className="px-4 py-2 w-full text-white rounded-lg border outline-none bg-white/5 border-white/10 focus:ring-2 focus:ring-orange-500"
            id="password"
            type="password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <Link
              href="/login"
              className="font-medium text-orange-400 hover:text-orange-300"
            >
              ¿Ya tienes una cuenta? Inicia sesión
            </Link>
          </div>
        </div>
        <div>
          <Button
            type="submit"
            variant="default"
            className="cursor-pointer justify-center w-full text-white bg-orange-600 hover:bg-orange-700"
            disabled={isPending || !isAppReady}
          >
            {isPending ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </div>
        {serverError && (
          <p className="text-sm text-center text-red-500">{serverError}</p>
        )}
      </form>
    </div>
  );
}
