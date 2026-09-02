export type FileOptimizationResult = {
    file: File;
    compressed: boolean;
    originalBytes: number;
    optimizedBytes: number;
};

const originalResult = (file: File): FileOptimizationResult => ({
    file,
    compressed: false,
    originalBytes: file.size,
    optimizedBytes: file.size,
});

const replaceExtension = (filename: string, extension: string) => {
    const base = filename.replace(/\.[^.]+$/, "") || "file";
    return `${base}.${extension}`;
};

export async function optimizeResume(
    file: File,
): Promise<FileOptimizationResult> {
    if (file.type !== "application/pdf") return originalResult(file);

    try {
        const { PDFDocument } = await import("pdf-lib");
        const source = await file.arrayBuffer();
        const document = await PDFDocument.load(source);
        const optimizedBytes = await document.save({
            addDefaultPage: false,
            updateFieldAppearances: false,
            useObjectStreams: true,
        });

        if (optimizedBytes.byteLength >= file.size) return originalResult(file);

        const optimizedFile = new File(
            [new Uint8Array(optimizedBytes)],
            replaceExtension(file.name, "pdf"),
            {
                type: "application/pdf",
                lastModified: file.lastModified,
            },
        );

        return {
            file: optimizedFile,
            compressed: true,
            originalBytes: file.size,
            optimizedBytes: optimizedFile.size,
        };
    } catch {
        return originalResult(file);
    }
}

type CapturableVideo = HTMLVideoElement & {
    captureStream?: () => MediaStream;
    mozCaptureStream?: () => MediaStream;
};

const waitForEvent = (
    target: EventTarget,
    eventName: string,
    errorName = "error",
) =>
    new Promise<void>((resolve, reject) => {
        const finish = () => {
            target.removeEventListener(eventName, handleSuccess);
            target.removeEventListener(errorName, handleError);
        };
        const handleSuccess = () => {
            finish();
            resolve();
        };
        const handleError = () => {
            finish();
            reject(new Error(`Media processing failed during ${eventName}.`));
        };

        target.addEventListener(eventName, handleSuccess, { once: true });
        target.addEventListener(errorName, handleError, { once: true });
    });

const chooseRecordingMimeType = () =>
    [
        "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
    ].find((type) => MediaRecorder.isTypeSupported(type));

export async function optimizeVideo(
    file: File,
    onProgress: (percentage: number) => void,
): Promise<FileOptimizationResult> {
    if (
        typeof window === "undefined" ||
        typeof MediaRecorder === "undefined" ||
        file.size < 2 * 1024 * 1024
    ) {
        return originalResult(file);
    }

    const video = document.createElement("video") as CapturableVideo;
    const sourceUrl = URL.createObjectURL(file);
    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;

    try {
        video.src = sourceUrl;
        video.preload = "auto";
        video.playsInline = true;
        video.muted = true;
        await waitForEvent(video, "loadedmetadata");

        if (!Number.isFinite(video.duration) || video.duration <= 0) {
            return originalResult(file);
        }

        const captureStream = video.captureStream ?? video.mozCaptureStream;
        const mimeType = chooseRecordingMimeType();
        if (!captureStream || !mimeType) return originalResult(file);

        stream = captureStream.call(video);
        if (!stream.getVideoTracks().length) return originalResult(file);

        const chunks: Blob[] = [];
        recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 1_000_000,
            audioBitsPerSecond: 96_000,
        });

        recorder.addEventListener("dataavailable", (event) => {
            if (event.data.size) chunks.push(event.data);
        });
        video.addEventListener("timeupdate", () => {
            onProgress(
                Math.min(99, Math.round((video.currentTime / video.duration) * 100)),
            );
        });

        const recordingStopped = waitForEvent(recorder, "stop");
        recorder.start(1_000);
        await video.play();
        await waitForEvent(video, "ended");
        recorder.stop();
        await recordingStopped;
        onProgress(100);

        const outputType = recorder.mimeType || mimeType;
        const extension = outputType.startsWith("video/mp4") ? "mp4" : "webm";
        const optimizedFile = new File(
            [new Blob(chunks, { type: outputType })],
            replaceExtension(file.name, extension),
            {
                type: outputType,
                lastModified: file.lastModified,
            },
        );

        if (!optimizedFile.size || optimizedFile.size >= file.size) {
            return originalResult(file);
        }

        return {
            file: optimizedFile,
            compressed: true,
            originalBytes: file.size,
            optimizedBytes: optimizedFile.size,
        };
    } catch {
        return originalResult(file);
    } finally {
        if (recorder?.state !== "inactive") recorder?.stop();
        video.pause();
        video.removeAttribute("src");
        video.load();
        stream?.getTracks().forEach((track) => track.stop());
        URL.revokeObjectURL(sourceUrl);
    }
}
