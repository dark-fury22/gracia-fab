import { z } from "zod";

export const submitContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  phone: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(1, "Message is required"),
});

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email is required"),
});

export const updateContactStatusSchema = z.object({
  status: z.enum(["new", "read", "replied"]),
});
