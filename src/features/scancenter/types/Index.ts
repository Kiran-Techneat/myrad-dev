// ─── Upload Entry Types ────────────────────────────────────────────────────────

export interface FolderEntry {
  type: "folder";
  folderName: string;
  files: File[];
}

export interface FileEntry {
  type: "file";
  file: File;
}

export type UploadEntry = FolderEntry | FileEntry;

// uploadEntries: scanItemId → entries for that scan item only
export type UploadEntriesState = Record<string, UploadEntry[]>;
export type DragOverState = Record<string, boolean>;

// ─── DICOM Types ───────────────────────────────────────────────────────────────

export interface DicomMeta {
  patientName: string;
  patientId: string;
  patientBirthDate: string;
  studyDate: string;
  modality: string;
  studyDescription: string;
  institutionName: string;
  manufacturer: string;
  bodyPart: string;
}

// ─── Upload Types ──────────────────────────────────────────────────────────────

export interface FilePair {
  file: File;
  scanItemId: string;
}

// cardProgress key = scanItemId — one value per scan item
export type CardProgressMap = Record<string, number | "done" | "error" | "reading" | "completing">;

// ─── Resumable Upload Session ────────────────────────────────────────────────
// Preserved across a network drop so the upload can continue byte-for-byte.
export interface MultipartPart {
  partNumber: number;
  presignedUrl: string;
}

export interface UploadSession {
  modal: PendingModal;
  // Each bucket is a group of prefixed files that get zipped into one multipart upload.
  buckets: { prefixedName: string; file: File }[][];
  bucketIndex: number;
  // Current bucket's zipped blob — kept in memory while the bucket is in flight.
  blob: Blob | null;
  // Current bucket's live multipart session (undefined until initiated).
  fileId?: string;
  s3Key?: string;
  uploadId?: string;
  parts?: MultipartPart[];
  // Part numbers that reached HTTP 200 for the current bucket.
  completedParts: Set<number>;
  // Last progress percentage, to keep the bar where it paused.
  loadedPct: number;
}
export type UploadSessionMap = Record<string, UploadSession>;

// Per-scan-item upload state, fully independent
export interface ScanItemUploadState {
  uploading: boolean; // S3 XHR in flight for this scan item
  done: boolean; // all files for this scan item uploaded to S3
  generatedFiles: { fileId: string; s3Key: string; scanItemId: string }[];
}
export type ScanItemUploadStateMap = Record<string, ScanItemUploadState>;

// ─── Modal Types ───────────────────────────────────────────────────────────────

export type ModalMode = "parsing" | "match" | "mismatch" | "unverified" | null;

export interface PendingModal {
  scanItemId: string;
  pairs: FilePair[];
  meta: DicomMeta | null;
}
