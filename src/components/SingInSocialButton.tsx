"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

interface Props {
  provider: "google";
  signUp?: boolean;
  disabled?: boolean;
}

export function SignInSocialButton({ provider, signUp, disabled }: Props) {
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
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setIsPending(false);
        },
      },
    });
  };

  const action = signUp ? "Registrarse" : "Iniciar sesión";

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || disabled}
      variant="default"
      className="cursor-pointer flex gap-2 justify-center items-center w-full text-white focus:ring-2 focus:ring-orange-500"
    >
      {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
      {action} con {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </Button>
  );
}
