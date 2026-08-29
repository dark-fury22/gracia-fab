import { z } from "zod";

// All fields are optional free-text the user typed into a multi-step form —
// there's no "wrong" answer, just cap length so it can't bloat the AI prompt.
const shortText = z.string().trim().max(200).optional().or(z.literal(""));

export const recommendSchema = z.object({
  skinType: shortText,
  skinConcerns: shortText,
  hairType: shortText,
  hairConcerns: shortText,
  lookingFor: shortText,
  budget: shortText,
  occasion: shortText,
});

export const routineSchema = z.object({
  skinType: z.string().trim().min(1, "Skin type is required").max(50),
  ageRange: z.string().trim().max(50).optional().or(z.literal("")),
  concerns: z.array(z.string().trim().max(50)).max(20).optional(),
  budget: z.string().trim().max(100).optional().or(z.literal("")),
});

export const searchSchema = z.object({
  query: z.string().trim().min(2, "Search query too short").max(300),
});

export const skinAnalysisSchema = z.object({
  imageBase64: z.string().min(1, "No image provided"),
  mimeType: z.string().trim().max(50).optional(),
});
