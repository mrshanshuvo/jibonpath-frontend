import { z } from "zod";
import type { User } from "@/types/entities.types";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number",
    ),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type AuthUser = User;
export type LoginPayload = LoginInput;
export type RegisterPayload = RegisterInput;

export interface AuthSessionResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
