export type StepId = 1 | 2 | 3 | 4 | 5;

export const STEP_LABELS: Record<StepId, string> = {
  1: "Live Selfie",
  2: "Government ID Number",
  3: "ID Front",
  4: "ID Back",
  5: "Self Declaration Video",
};

export const STEP_ORDER: StepId[] = [1, 2, 3, 4, 5];
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_RECORDING_SECONDS = 30;

export const DECLARATION_TEXT =
  "I hereby solemnly declare that I am the person named in the documents submitted for KYC verification. All information and documents provided by me are genuine, accurate, and complete to the best of my knowledge. I understand that providing false information is a legal offence and may result in the termination of my account and legal action. I consent to the processing of my personal data for identity verification purposes.";

/* ── Session ── */

export const KYC_SESSION_KEY = "mah-kyc-session";

export const GOV_ID_TYPES = [
  "Passport",
  "National Id",
  "Driving License",
  "Voter Id",
  "Aadhar",
  "PAN",
  "Other",
] as const;

export type GovIdType = (typeof GOV_ID_TYPES)[number] | "";

export type KycSession = { idType: GovIdType; idNumber: string; idConfirmed: boolean };

export function loadSession(): Partial<KycSession> {
  try {
    const raw = localStorage.getItem(KYC_SESSION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function persistSession(data: KycSession) {
  try { localStorage.setItem(KYC_SESSION_KEY, JSON.stringify(data)); } catch {}
}

/* ── Domain types ── */

export type UploadedFile = { name: string; preview: string | null; isImage: boolean; rawFile: File };

export type KycVerification = {
  liveSelfie: string | null;
  selfDeclarationVideo: string | null;
  governmentIdType: string | null;
  governmentIdNumber: string | null;
  governmentIdFront: string | null;
  governmentIdBack: string | null;
  remarks: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: { firstName?: string; lastName?: string; email?: string } | null;
};

export type ClientData = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  kycStatus: string;
  kycVerification: KycVerification | null;
  notes: string | null;
};

/* ── Helpers ── */

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function isVideoUrl(url: string): boolean {
  return url.includes("/video/upload/") || /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
}
