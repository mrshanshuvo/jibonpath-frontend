"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  UserPlus,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { registerSchema, type RegisterInput } from "../types";
import { useRegister } from "../api/auth.queries";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        type="text"
        placeholder="e.g. Shuvo Ahmed"
        autoComplete="name"
        required
        leftIcon={<UserIcon className="h-4 w-4" />}
        error={errors.name?.message}
        disabled={registerMutation.isPending}
        {...register("name")}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="you@domain.com"
        autoComplete="email"
        required
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        disabled={registerMutation.isPending}
        {...register("email")}
      />

      <div className="space-y-1">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Min. 6 chars with uppercase & number"
          autoComplete="new-password"
          required
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground focus:outline-hidden transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          error={errors.password?.message}
          disabled={registerMutation.isPending}
          {...register("password")}
        />
        <p className="text-3xs text-muted-foreground">
          Must include at least 1 uppercase letter, 1 lowercase letter, and 1 number.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Contact Phone"
          type="tel"
          placeholder="017XXXXXXXX"
          autoComplete="tel"
          leftIcon={<Phone className="h-4 w-4" />}
          error={errors.phone?.message}
          disabled={registerMutation.isPending}
          {...register("phone")}
        />

        <Input
          label="Residential Area / Address"
          type="text"
          placeholder="e.g. Dhanmondi, Dhaka"
          autoComplete="street-address"
          leftIcon={<MapPin className="h-4 w-4" />}
          error={errors.address?.message}
          disabled={registerMutation.isPending}
          {...register("address")}
        />
      </div>

      <Button
        type="submit"
        variant="emergency"
        size="lg"
        className="w-full font-semibold shadow-lg shadow-emergency/20 mt-2"
        isLoading={registerMutation.isPending}
        leftIcon={<UserPlus className="h-4 w-4" />}
      >
        Complete Registration
      </Button>

      <div className="pt-2 text-center text-xs text-muted-foreground">
        <span>Already registered? </span>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Sign in to your account
        </Link>
      </div>
    </form>
  );
}
