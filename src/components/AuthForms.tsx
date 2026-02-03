"use client";

import Link from "next/link";
import { useActionState } from "react";

import { authenticate, register, RegisterState } from "@/actions/auth";
import { Button } from "@/components/ui/button";

const isAppReady = false;

export function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={dispatch} className="space-y-4">
      <div>
        <label
          className="block mb-1 text-sm font-medium text-gray-300"
          htmlFor="email"
        >
          Email
        </label>
        <input
          className="px-4 py-2 w-full text-white rounded-lg border outline-none bg-white/5 border-white/10 focus:ring-2 focus:ring-orange-500"
          id="email"
          type="email"
          name="email"
          placeholder="user@example.com"
          required
        />
      </div>
      <div>
        <label
          className="block mb-1 text-sm font-medium text-gray-300"
          htmlFor="password"
        >
          Contraseña
        </label>
        <input
          className="px-4 py-2 w-full text-white rounded-lg border outline-none bg-white/5 border-white/10 focus:ring-2 focus:ring-orange-500"
          id="password"
          type="password"
          name="password"
          required
          minLength={6}
        />
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
          variant="default"
          className="justify-center w-full text-white bg-orange-600 hover:bg-orange-700"
          disabled={isPending}
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
  );
}

const initialRegisterState: RegisterState = { message: "", errors: {} };

export function RegisterForm() {
  const [state, dispatch, isPending] = useActionState(
    register,
    initialRegisterState,
  );

  return (
    <form action={dispatch} className="space-y-4">
      <div>
        <label
          className="block mb-1 text-sm font-medium text-gray-300"
          htmlFor="name"
        >
          Nombre
        </label>
        <input
          className="px-4 py-2 w-full text-white rounded-lg border outline-none bg-white/5 border-white/10 focus:ring-2 focus:ring-orange-500"
          id="name"
          type="text"
          name="name"
          placeholder="John Doe"
          required
        />
        {state.errors?.name && (
          <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>
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
          className="px-4 py-2 w-full text-white rounded-lg border outline-none bg-white/5 border-white/10 focus:ring-2 focus:ring-orange-500"
          id="email"
          type="email"
          name="email"
          required
        />
        {state.errors?.email && (
          <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>
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
          className="px-4 py-2 w-full text-white rounded-lg border outline-none bg-white/5 border-white/10 focus:ring-2 focus:ring-orange-500"
          id="password"
          type="password"
          name="password"
          required
          minLength={6}
        />
        {state.errors?.password && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.password[0]}
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
          variant="default"
          className="justify-center w-full text-white bg-orange-600 hover:bg-orange-700"
          disabled={isPending || !isAppReady}
        >
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </div>
      {state.message && (
        <p className="text-sm text-center text-red-500">{state.message}</p>
      )}
    </form>
  );
}
