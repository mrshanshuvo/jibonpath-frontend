import { z } from "zod";
import type { User } from "@/types/entities.types";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number",
    ),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^(?:\+?880\s?|0)1[3-9]\d{8}$|^[+\d][\d\s\-()]{7,16}$/.test(val),
      "Enter a valid phone number (e.g. 017XXXXXXXX or +8801XXXXXXXXX)",
    ),
  address: z.string().trim().optional(),
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
