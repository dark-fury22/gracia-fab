// Where admin-uploaded product images are stored.
//
// Render's disk is ephemeral — anything written there vanishes on the next
// deploy or restart — so in production images go to Cloudinary (the same
// account the existing product photos live on). Local disk is only used in
// development, so you can work on the admin dashboard without Cloudinary keys.
//
// Env (either form works):
//   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
//   or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_FOLDER = "gracia-fab/products";

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET),
  );
}

function configureCloudinary() {
  // With CLOUDINARY_URL set, the SDK reads it from the environment itself.
  if (!process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  cloudinary.config({ secure: true });
}

export class ImageStorageNotConfiguredError extends Error {}

// Stores an image and returns its public URL.
//   imageBase64 — raw base64 (no data: prefix)
//   mimeType    — already validated against the allow-list
//   extension   — derived from mimeType by the caller
//   req         — used only for the local-disk URL in development
export async function storeProductImage({ imageBase64, mimeType, extension, req }) {
  if (isCloudinaryConfigured()) {
    configureCloudinary();
    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${imageBase64}`,
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: "image",
        // Belt and braces with the MIME allow-list: never store SVG etc.
        allowed_formats: ["jpg", "png", "webp", "gif"],
      },
    );
    return { url: result.secure_url, storage: "cloudinary" };
  }

  if (process.env.NODE_ENV === "production") {
    // Refuse rather than write to Render's disk and lose the file on the next
    // deploy — that's the bug this module exists to fix.
    throw new ImageStorageNotConfiguredError(
      "Image uploads aren't set up yet: add the Cloudinary keys to the server's environment.",
    );
  }

  const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
  const uploadDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../public/uploads",
  );
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(imageBase64, "base64"));

  return {
    url: `${req.protocol}://${req.get("host")}/uploads/${filename}`,
    storage: "local",
  };
}
