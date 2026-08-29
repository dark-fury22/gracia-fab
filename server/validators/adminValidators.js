import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().min(1, "Description is required"),
  price: z.coerce.number().nonnegative("Price cannot be negative"),
  image: z.string().trim().min(1, "Image is required"),
  category: z.string().trim().min(1, "Category is required"),
  brand: z.string().trim().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  tags: z.string().trim().optional(),
  isFeatured: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const uploadImageSchema = z.object({
  imageBase64: z.string().min(1, "No image data provided"),
  mimeType: z.string().trim().max(50).optional(),
});
