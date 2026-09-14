import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().min(1, "Description is required"),
  price: z.coerce.number().nonnegative("Price cannot be negative"),
  image: z.string().trim().min(1, "Image is required"),
  secondaryImage: z.string().trim().optional(),
  category: z.string().trim().min(1, "Category is required"),
  brand: z.string().trim().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  tags: z.string().trim().optional(),
  isFeatured: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// SVG is deliberately excluded: it can embed <script>, which would let an
// uploaded "product image" execute as stored XSS when someone opens the
// file's URL directly.
export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const uploadImageSchema = z.object({
  imageBase64: z
    .string()
    .min(1, "No image data provided")
    // ~10MB of raw bytes once base64-decoded (base64 is ~4/3 the byte size).
    .max(14_000_000, "Image is too large"),
  mimeType: z.enum(ALLOWED_UPLOAD_MIME_TYPES, {
    errorMap: () => ({
      message: `mimeType must be one of: ${ALLOWED_UPLOAD_MIME_TYPES.join(", ")}`,
    }),
  }),
});
