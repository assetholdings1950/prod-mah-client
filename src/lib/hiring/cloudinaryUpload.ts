import axios from "axios";

export type HiringAssetType = "resume" | "introduction_video" | "assessment_attachment";

type UploadSignature = {
    timestamp: number;
    folder: string;
    signature: string;
    cloudName: string;
    public_id: string;
    apiKey: string;
    resourceType: "image" | "raw" | "video";
    transformation?: string;
};

export type HiringUpload = {
    url: string;
    publicId: string;
    resourceType: "image" | "raw" | "video";
    format: string | null;
    bytes: number;
    originalFilename: string;
};

type CloudinaryUploadResponse = {
    secure_url?: string;
    public_id?: string;
    resource_type?: "image" | "raw" | "video";
    format?: string;
    bytes?: number;
    error?: { message?: string };
};

export async function uploadHiringAsset(
    assetType: HiringAssetType,
    candidateName: string,
    file: File,
    onProgress: (percentage: number) => void,
    candidateAccess?: {
        applicationReference: string;
        trackingToken?: string;
        accessToken?: string;
    },
): Promise<HiringUpload> {
    const fileExtension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const signatureResponse = await axios.post<UploadSignature>(
        "/api/hiring/cloudinary-signature",
        {
            assetType,
            candidateName,
            mimeType: file.type,
            fileExtension,
            ...(candidateAccess
                ? {
                      reference: candidateAccess.applicationReference,
                      token: candidateAccess.trackingToken,
                      access: candidateAccess.accessToken,
                  }
                : {}),
        },
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

        xhr.onerror = () =>
            reject(new Error(`Network error while uploading ${file.name}.`));
        xhr.onabort = () =>
            reject(new Error(`Upload cancelled for ${file.name}.`));
        xhr.onload = () => {
            let response: CloudinaryUploadResponse = {};
            try {
                response = JSON.parse(xhr.responseText);
            } catch {}

            if (
                xhr.status >= 200 &&
                xhr.status < 300 &&
                response.secure_url &&
                response.public_id &&
                response.resource_type
            ) {
                onProgress(100);
                resolve({
                    url: response.secure_url,
                    publicId: response.public_id,
                    resourceType: response.resource_type,
                    format: response.format ?? null,
                    bytes: response.bytes ?? file.size,
                    originalFilename: file.name,
                });
                return;
            }

            reject(
                new Error(
                    response.error?.message ?? `Upload failed for ${file.name}.`,
                ),
            );
        };

        const body = new FormData();
        body.append("file", file, file.name);
        body.append("api_key", signed.apiKey);
        body.append("timestamp", String(signed.timestamp));
        body.append("signature", signed.signature);
        body.append("folder", signed.folder);
        body.append("public_id", signed.public_id);
        body.append("overwrite", "false");
        body.append("invalidate", "true");
        if (signed.transformation) {
            body.append("transformation", signed.transformation);
        }
        xhr.send(body);
    });
}
