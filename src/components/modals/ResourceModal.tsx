"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define the props expected on the child form component
// We use a generic interface for the props the form might accept
export interface ModalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  [key: string]: unknown;
}

interface BaseModalProps {
  title: string;
  description?: string;
  // Enforce children to be a ReactElement that accepts our props
  children: React.ReactElement<ModalFormProps>;
}

interface CreateResourceModalProps extends BaseModalProps {
  triggerLabel: string | React.ReactNode;
}

export function CreateResourceModal({
  triggerLabel,
  title,
  description,
  children,
}: CreateResourceModalProps) {
  const [open, setOpen] = useState(false);

  // Inject onSuccess and onCancel to close the modal
  const content = React.cloneElement(children, {
    onSuccess: () => {
      setOpen(false);
      // Call original prop if it existed
      if (children.props.onSuccess) children.props.onSuccess();
    },
    onCancel: () => {
      setOpen(false);
      if (children.props.onCancel) children.props.onCancel();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl shadow-xl border-gray-900/10 bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}

interface EditResourceModalProps extends BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditResourceModal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: EditResourceModalProps) {
  // Inject onSuccess and onCancel to close the modal
  const content = React.cloneElement(children, {
    onSuccess: () => {
      onOpenChange(false);
      if (children.props.onSuccess) children.props.onSuccess();
    },
    onCancel: () => {
      onOpenChange(false);
      if (children.props.onCancel) children.props.onCancel();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl shadow-xl border-gray-900/10 bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
