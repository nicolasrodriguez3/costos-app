"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { useActionState } from "react";
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

const initialState: WaitlistState = {
  success: false,
  message: "",
};

export function WaitlistForm() {
  const [state, formAction, isPending] = useActionState(
    subscribeToWaitlist,
    initialState,
  );

  const {
    register,
    formState: { errors },
    getValues,
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    mode: "onBlur",
  });

  if (state.success && state.message) {
    return (
      <div className="text-center py-8 px-4 rounded-xl bg-linear-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-xl font-semibold text-white mb-2">
          ¡Listo {getValues("name")}!
        </p>
        <p className="text-gray-300">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">
          Nombre
        </Label>
        <Input
          {...register("name")}
          id="name"
          name="name"
          type="text"
          placeholder="Tu nombre"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {(errors.name || state.errors?.name) && (
          <p className="text-sm text-red-400">
            {errors.name?.message || state.errors?.name?.[0]}
          </p>
        )}
      </div>

      <div className="space-y-2 mb-6">
        <Label htmlFor="email" className="text-gray-300">
          Email
        </Label>
        <Input
          {...register("email")}
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {(errors.email || state.errors?.email) && (
          <p className="text-sm text-red-400">
            {errors.email?.message || state.errors?.email?.[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Registrando...
          </>
        ) : (
          "Unirme a la lista de espera"
        )}
      </Button>

      {!state.success && state.message && (
        <p className="text-sm text-red-400 text-center">{state.message}</p>
      )}
    </form>
  );
}
