import { optimizeKycImage, uploadKycAsset } from "@/lib/kycUpload";

export async function uploadToCloudinary(file: File, _userId: string, _clientName: string): Promise<string> {
  const optimized = await optimizeKycImage(file, file.name, 1280, 0.82);
  return uploadKycAsset("profile_image", optimized.blob, optimized.filename, () => {});
}
