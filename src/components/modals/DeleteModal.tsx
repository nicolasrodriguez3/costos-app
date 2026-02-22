"use client";

import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/types/actions/common";

interface DeleteModalProps {
  id: string;
  name: string;
  type: string;
  action: (id: string) => Promise<ActionState>;
}

export function DeleteModal({ id, name, type, action }: DeleteModalProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    const response = await action(id);
    if (response.success) {
      setOpen(false);
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Borrar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm" className="bg-white border-none">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon className="size-8" />
          </AlertDialogMedia>
          <AlertDialogTitle>Eliminar {name}</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar este {type}? Esta acción no se
            puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="secondary">Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
