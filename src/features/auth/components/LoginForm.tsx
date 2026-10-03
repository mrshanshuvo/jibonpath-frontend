"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { loginSchema, type LoginInput } from "../types";
import { useLogin } from "../api/auth.queries";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email Address"
        type="email"
        placeholder="you@domain.com"
        autoComplete="email"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        disabled={loginMutation.isPending}
        {...register("email")}
      />

      <div className="space-y-1">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="current-password"
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
          disabled={loginMutation.isPending}
          {...register("password")}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full font-semibold shadow-md shadow-primary/20"
        isLoading={loginMutation.isPending}
        leftIcon={<LogIn className="h-4 w-4" />}
      >
        Sign In to Portal
      </Button>

      <div className="pt-2 text-center text-xs text-muted-foreground">
        <span>Need an emergency response account? </span>
        <Link
          href={ROUTES.AUTH.REGISTER}
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Create patient account
        </Link>
      </div>
    </form>
  );
}
