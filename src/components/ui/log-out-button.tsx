"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOutAction } from "@/actions/auth";
import { Button } from "./button";

export const LogOutButton = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const result = await signOutAction();
    if (result) {
      router.push("/login");
    }
    setIsLoggingOut(false);
  };
  return (
    <Button
      variant="outline"
      size="sm"
      className="cursor-pointer"
      onClick={handleSignOut}
    >
      {isLoggingOut ? (
        <Loader2 className="mr-1 size-4 animate-spin" />
      ) : (
        <LogOut className="mr-1 size-4" />
      )}
      Cerrar Sesión
    </Button>
  );
};
