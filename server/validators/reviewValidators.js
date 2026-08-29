import { z } from "zod";

export const addReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z.string().trim().min(1, "Comment is required").max(2000),
  skinType: z.string().trim().optional(),
});
