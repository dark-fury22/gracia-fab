import { z } from "zod";

export const redeemPointsSchema = z.object({
  pointsToRedeem: z.coerce.number().int().positive("Points must be a positive number"),
});
