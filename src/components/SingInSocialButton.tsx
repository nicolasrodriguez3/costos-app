"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";

interface Props {
  provider: "google";
  signUp?: boolean;
}

export function SignInSocialButton({ provider, signUp }: Props) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    await signIn.social({
      provider,
      callbackURL: "/dashboard",
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setIsPending(false);
        },
      },
    });
  };

  const action = signUp ? "Registrarse" : "Iniciar sesión";

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex gap-2 justify-center items-center px-4 py-2 w-full text-white rounded-lg border outline-none bg-white/5 border-white/10 focus:ring-2 focus:ring-orange-500"
    >
      {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
      {action} con {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </button>
  );
}
