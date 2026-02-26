"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "./button";

export const GoBackButton = () => {
  return (
    <Button size="lg" variant="outline" className="rounded-full gap-2 transition-transform hover:scale-105" onClick={() => window.history.back()}>
      <ArrowLeft className="w-4 h-4" />
      Volver atrás
    </Button>
  )
}