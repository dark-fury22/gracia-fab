import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  skinType: z.enum(["oily", "dry", "combination", "normal", "sensitive"]).optional(),
  hairType: z.enum(["straight", "wavy", "curly", "coily"]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").max(100).optional(),
});

export const googleLoginSchema = z.object({
  access_token: z.string().min(1, "Google access token is required"),
});

export const facebookLoginSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  userID: z.string().min(1, "User ID is required"),
  name: z.string().trim().optional(),
});
