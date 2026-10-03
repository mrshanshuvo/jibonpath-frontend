"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input } from "@/components/ui";
import { UserPlus, User, Mail, Lock, CreditCard, Phone } from "lucide-react";
import {
  createDriverSchema,
  type CreateDriverInput,
} from "../types";
import { useCreateDriver } from "../api/admin.queries";

interface DriverOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DriverOnboardingModal({
  isOpen,
  onClose,
}: DriverOnboardingModalProps) {
  const createMutation = useCreateDriver();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDriverInput>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      licenseNumber: "",
      phone: "",
    },
  });

  const onSubmit = (data: CreateDriverInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Commission Paramedic Driver"
      description="Create a certified driver account with BRTA heavy commercial license validation."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Paramedic Full Name"
          placeholder="e.g. Mohammad Rafiq"
          required
          leftIcon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          disabled={createMutation.isPending}
          {...register("name")}
        />

        <Input
          label="Driver Email Address"
          type="email"
          placeholder="driver@ambulance.dev"
          required
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          disabled={createMutation.isPending}
          {...register("email")}
        />

        <Input
          label="Temporary Login Password"
          type="password"
          placeholder="Min 6 characters"
          required
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          disabled={createMutation.isPending}
          {...register("password")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="BRTA License Number"
            placeholder="e.g. DL-DHAKA-2023-8899"
            required
            leftIcon={<CreditCard className="h-4 w-4" />}
            error={errors.licenseNumber?.message}
            disabled={createMutation.isPending}
            {...register("licenseNumber")}
          />

          <Input
            label="Direct Emergency Phone"
            type="tel"
            placeholder="017XXXXXXXX"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            disabled={createMutation.isPending}
            {...register("phone")}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={createMutation.isPending}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Commission Driver
          </Button>
        </div>
      </form>
    </Modal>
  );
}
