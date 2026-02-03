"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { subscribeToWaitlist, WaitlistState } from "@/actions/waitlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const waitlistSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.email("Por favor ingresa un email válido"),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

export function WaitlistForm() {
  const [state, setState] = useState<WaitlistState>({
    success: false,
    message: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: WaitlistFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      const result = await subscribeToWaitlist(formData);
      setState({ ...result, name: data.name });
    });
  };

  if (state.success && state.message) {
    return (
      <div className="relative overflow-hidden px-4 py-8 text-center rounded-xl border bg-linear-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 opacity-0 scale-95 translate-y-[10px] animate-success-entrance">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 -left-full h-full w-1/2 bg-linear-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] animate-shine-sweep" />
        </div>

        <div className="mb-4 relative inline-flex justify-center items-center w-16 h-16 rounded-full bg-green-500/20 animate-icon-pop shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <Check className="relative w-8 h-8 text-green-400" />
        </div>

        <div className="relative z-10">
          <p
            className="mb-2 text-xl font-semibold text-white opacity-0 translate-y-[10px] animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            ¡Listo {state.name}!
          </p>
          <p
            className="text-gray-300 opacity-0 translate-y-[10px] animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">
          Nombre
        </Label>
        <Input
          {...register("name")}
          id="name"
          type="text"
          placeholder="Tu nombre"
          className="text-white bg-white/5 border-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {(errors.name || state.errors?.name) && (
          <p className="text-sm text-red-400">
            {errors.name?.message || state.errors?.name?.[0]}
          </p>
        )}
      </div>

      <div className="mb-6 space-y-2">
        <Label htmlFor="email" className="text-gray-300">
          Email
        </Label>
        <Input
          {...register("email")}
          id="email"
          type="email"
          placeholder="tu@email.com"
          className="text-white bg-white/5 border-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {(errors.email || state.errors?.email) && (
          <p className="text-sm text-red-400">
            {errors.email?.message || state.errors?.email?.[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            Registrando...
          </>
        ) : (
          "Unirme a la lista de espera"
        )}
      </Button>

      {!state.success && state.message && (
        <p className="text-sm text-center text-red-400">{state.message}</p>
      )}
    </form>
  );
}
