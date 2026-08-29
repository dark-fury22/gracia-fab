import { z } from "zod";

export const saveRecommendationSchema = z.object({
  profile: z
    .object({
      skinType: z.string().trim().max(50).optional().or(z.literal("")),
      hairType: z.string().trim().max(50).optional().or(z.literal("")),
      occasion: z.string().trim().max(50).optional().or(z.literal("")),
    })
    .optional(),
  productIds: z.array(z.string()).optional(),
  // Legacy fallback: full product objects instead of bare ids.
  products: z.array(z.union([z.string(), z.object({ _id: z.string() }).passthrough()])).optional(),
});
