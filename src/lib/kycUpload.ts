import axios from "axios";

export type KycAssetType =
  | "selfie"
  | "id_front"
  | "id_back"
  | "declaration_video"
  | "deposit_proof"
  | "profile_image";

export type OptimizedUpload = { blob: Blob; filename: string };

type UploadSignature = {
  timestamp: number;
  folder: string;
  signature: string;
  cloudName: string;
  public_id: string;
  apiKey: string;
  resourceType: "image" | "video";
};

export async function optimizeKycImage(
  source: Blob,
  filename: string,
  maxDimension = 1920,
  quality = 0.82,
): Promise<OptimizedUpload> {
  // PDFs must remain documents; Cloudinary handles them through the image API.
  if (source.type === "application/pdf") return { blob: source, filename };
  if (!source.type.startsWith("image/")) return { blob: source, filename };
  if (typeof createImageBitmap !== "function") return { blob: source, filename };

  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return { blob: source, filename };
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) return { blob: source, filename };

  const baseName = filename.replace(/\.[^.]+$/, "") || "kyc-image";
  return { blob, filename: `${baseName}.jpg` };
}

export async function uploadKycAsset(
  assetType: KycAssetType,
  file: Blob,
  filename: string,
  onProgress: (percentage: number) => void,
): Promise<string> {
  const signatureResponse = await axios.post<UploadSignature>(
    "/api/cloudinary/signature",
    { assetType },
    { withCredentials: true },
  );
  const signed = signatureResponse.data;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/${signed.resourceType}/upload`,
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onerror = () => reject(new Error(`Network error while uploading ${filename}.`));
    xhr.onabort = () => reject(new Error(`Upload cancelled for ${filename}.`));
    xhr.onload = () => {
      let response: { secure_url?: string; error?: { message?: string } } = {};
      try { response = JSON.parse(xhr.responseText); } catch {}

      if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
        onProgress(100);
        resolve(response.secure_url);
        return;
      }

      reject(new Error(response.error?.message || `Upload failed for ${filename}.`));
    };

    const body = new FormData();
    body.append("file", file, filename);
    body.append("api_key", signed.apiKey);
    body.append("timestamp", String(signed.timestamp));
    body.append("signature", signed.signature);
    body.append("folder", signed.folder);
    body.append("public_id", signed.public_id);
    body.append("overwrite", "true");
    body.append("invalidate", "true");
    xhr.send(body);
  });
}
