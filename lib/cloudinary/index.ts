import { v2 as cloudinary } from "cloudinary";
import { env, isCloudinaryEnabled } from "@/lib/env";

export function configureCloudinary() {
  if (!isCloudinaryEnabled()) return false;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return true;
}

export function extractCloudinaryPublicId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes("cloudinary.com")) return null;
    const parts = urlObj.pathname.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    let start = uploadIndex + 1;
    if (parts[start]?.match(/^v\d+$/)) start++;
    const publicIdWithExt = parts.slice(start).join("/");
    return publicIdWithExt.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

export async function uploadImage(
  file: string,
  folder = "products"
): Promise<{ url: string; publicId: string }> {
  if (!configureCloudinary()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_* keys to .env");
  }

  const result = await cloudinary.uploader.upload(file, {
    folder: `shopflow/${folder}`,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!configureCloudinary() || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Ignore Cloudinary delete failures
  }
}

export async function deleteImageByUrl(url: string): Promise<void> {
  const publicId = extractCloudinaryPublicId(url);
  if (publicId) await deleteImage(publicId);
}

export async function deleteImagesByUrls(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => deleteImageByUrl(url)));
}

export async function uploadMultipleImages(files: string[], folder = "products") {
  return Promise.all(files.map((file) => uploadImage(file, folder)));
}
