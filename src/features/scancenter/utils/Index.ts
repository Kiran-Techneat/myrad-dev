import type { DicomMeta, FilePair, FolderEntry, UploadEntry } from "../types/Index";
import codeValues from "@/utils/codevalue.json";
import dayjs from "dayjs";
import { DATE_DISPLAY_FORMAT } from "@/utils/dateFormats";

// ─── Modality Code Expansion ───────────────────────────────────────────────────

const modalityMap: Record<string, string> = Object.fromEntries(
  codeValues.map((e) => [e.codeValue.toUpperCase(), e.codeMeaning]),
);

export const expandModalityCode = (code: string): string =>
  modalityMap[code.trim().toUpperCase()] ?? code;

export const stripScanWord = (s: string): string =>
  s.replace(/\bscan\b/gi, "").replace(/\s+/g, " ").trim();

// ─── Formatting ────────────────────────────────────────────────────────────────

export const formatSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const totalFolderSize = (files: File[]): number =>
  files.reduce((sum, f) => sum + f.size, 0);

export const cardKey = (scanItemId: string, idx: number) =>
  `${scanItemId}::${idx}`;

// ─── File / Content Type ───────────────────────────────────────────────────────

export const resolveContentType = (_fileName: string): string => {
  return "application/octet-stream";
};

// ─── DICOM Detection ───────────────────────────────────────────────────────────

const DICOM_EXTENSIONS = new Set([".dcm", ".dicom"]);

// Returns true if the file has a known DICOM extension.
const hasDicomExtension = (file: File): boolean => {
  const lower = file.name.toLowerCase();
  const dotIdx = lower.lastIndexOf(".");
  if (dotIdx === -1) return false;
  return DICOM_EXTENSIONS.has(lower.slice(dotIdx));
};

// Returns true if the file has no extension at all.
const hasNoExtension = (file: File): boolean =>
  !file.name.includes(".");

// Reads the first 132 bytes and checks for the DICOM magic "DICM" at offset 128.
const hasDicomMagicBytes = async (file: File): Promise<boolean> => {
  if (file.size < 132) return false;
  try {
    const buf = await file.slice(128, 132).arrayBuffer();
    const arr = new Uint8Array(buf);
    return arr[0] === 0x44 && arr[1] === 0x49 && arr[2] === 0x43 && arr[3] === 0x4d; // "DICM"
  } catch {
    return false;
  }
};

const DICOM_DIR_FILENAME = "dicom.dir";

export const hasDicomDirFile = (files: File[]): boolean =>
  files.some((f) => f.name.toLowerCase() === DICOM_DIR_FILENAME);

export const extractDicomDirFile = (files: File[]): File | undefined =>
  files.find((f) => f.name.toLowerCase() === DICOM_DIR_FILENAME);

// Returns true only for genuine DICOM files:
//   - .dcm / .dicom extension → accept immediately
//   - no extension → check magic bytes
//   - any other extension (.pdf, .exe, .jpg, etc.) → reject without reading
export const isDicomFile = async (file: File): Promise<boolean> => {
  if (hasDicomExtension(file)) return true;
  if (hasNoExtension(file)) return hasDicomMagicBytes(file);
  return false;
};

export const filterDicomFiles = async (files: File[]): Promise<File[]> => {
  const checks = await Promise.all(files.map(isDicomFile));
  return files.filter((_, i) => checks[i]);
};

// ─── Folder Grouping ───────────────────────────────────────────────────────────

// Collects all DICOM files under a single folder entry named rootName.
// One card per folder selection, regardless of nesting depth.
export const groupDicomFilesBySubfolder = (
  dicomFiles: File[],
  rootName: string,
): FolderEntry[] => {
  if (!dicomFiles.length) return [];
  return [{ type: "folder", folderName: rootName, files: dicomFiles }];
};

// ─── FileSystemDirectoryHandle Traversal ──────────────────────────────────────

// Tracks relative paths for files obtained via the File System Access API.
// WeakMap so entries are GC'd when the File object is no longer referenced.
const fsaFilePathMap = new WeakMap<File, string>();

// Recursively reads all File objects from a FileSystemDirectoryHandle.
// Stores each file's path relative to the selected root in fsaFilePathMap.
// Used by the "Upload from PC" path (showDirectoryPicker).
export const readDirectoryHandleFiles = async (
  handle: FileSystemDirectoryHandle,
  path = "",
): Promise<File[]> => {
  const files: File[] = [];
  // @ts-ignore — entries() is standard but TS lib may not include it yet
  for await (const [name, entry] of handle.entries()) {
    const entryPath = path ? `${path}/${name}` : name;
    if (entry.kind === "file") {
      const file = await (entry as FileSystemFileHandle).getFile();
      fsaFilePathMap.set(file, entryPath);
      files.push(file);
    } else if (entry.kind === "directory") {
      const sub = await readDirectoryHandleFiles(entry as FileSystemDirectoryHandle, entryPath);
      files.push(...sub);
    }
  }
  return files;
};

// ─── DICOM Parsing ─────────────────────────────────────────────────────────────

export const parseDicomMeta = async (file: File): Promise<DicomMeta | null> => {
  try {
    const dicomParser = (await import("dicom-parser")).default;
    const buffer = await file.arrayBuffer();
    const byteArray = new Uint8Array(buffer);
    const dataSet = dicomParser.parseDicom(byteArray, { untilTag: "00200013" });
    const str = (tag: string): string => {
      try {
        return (dataSet.string(tag) ?? "").trim();
      } catch {
        return "";
      }
    };
    return {
      patientName: str("x00100010"),
      patientId: str("x00100020"),
      patientBirthDate: str("x00100030"),
      studyDate: str("x00080020"),
      modality: str("x00080060"),
      studyDescription: str("x00081030"),
      institutionName: str("x00080080"),
      manufacturer: str("x00080070"),
      bodyPart: str("x00180015"),
    };
  } catch {
    return null;
  }
};

export const extractDicomMetaFromEntries = async (
  entries: UploadEntry[],
): Promise<DicomMeta | null> => {
  for (const entry of entries) {
    const files = entry.type === "folder" ? entry.files : [entry.file];
    for (const file of files) {
      const lower = file.name.toLowerCase();
      // Skip zip archives, DICOMDIR and DICOM.DIR (directory index, not a patient image)
      if (lower.endsWith(".zip") || lower === "dicomdir" || lower === DICOM_DIR_FILENAME) continue;
      const meta = await parseDicomMeta(file);
      // Only accept meta that carries at least one patient identifier
      if (meta && (meta.patientName.trim() || meta.patientId.trim())) return meta;
    }
  }
  return null;
};

// ─── Meta Matching ─────────────────────────────────────────────────────────────

const normalize = (s: string | null | undefined): string =>
  (s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

export const checkMetaMatch = (
  meta: DicomMeta,
  details: { fullName: string; patientId: string; scanType?: string; bodyPart?: string },
): boolean => {
  const metaId = normalize(meta.patientId);
  const detailId = normalize(details.patientId);
  const idMatch = metaId !== "" && detailId !== "" && metaId === detailId;

  const dicomNameNorm = normalize((meta.patientName ?? "").replace("^", " "));
  const detailNameNorm = normalize(details.fullName);
  const nameMatch =
    dicomNameNorm !== "" &&
    detailNameNorm !== "" &&
    (dicomNameNorm === detailNameNorm ||
      dicomNameNorm.includes(detailNameNorm) ||
      detailNameNorm.includes(dicomNameNorm));

  const patientMatch = idMatch || nameMatch;

  // Body part / study type are only checked when the DICOM file actually carries
  // a value for them — many DICOM files omit one or both, and absence shouldn't
  // be treated as a mismatch.
  const dicomBodyPartNorm = normalize(meta.bodyPart);
  const detailBodyPartNorm = normalize(details.bodyPart);
  const bodyPartMatch =
    dicomBodyPartNorm === "" ||
    detailBodyPartNorm === "" ||
    dicomBodyPartNorm === detailBodyPartNorm ||
    dicomBodyPartNorm.includes(detailBodyPartNorm) ||
    detailBodyPartNorm.includes(dicomBodyPartNorm);

  const dicomStudyTypeNorm = normalize(expandModalityCode(meta.modality)) || normalize(meta.studyDescription);
  const detailStudyTypeNorm = normalize(expandModalityCode(stripScanWord(details.scanType ?? "")));
  const studyTypeMatch =
    dicomStudyTypeNorm === "" ||
    detailStudyTypeNorm === "" ||
    dicomStudyTypeNorm === detailStudyTypeNorm ||
    dicomStudyTypeNorm.includes(detailStudyTypeNorm) ||
    detailStudyTypeNorm.includes(dicomStudyTypeNorm);

  return patientMatch && bodyPartMatch && studyTypeMatch;
};

// ─── Report Extract Match ──────────────────────────────────────────────────────

export interface ReportPatientRecord {
  fullName?: string;
  patientMrnNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface ReportExtractRecord {
  patientName?: string;
  mrn?: string;
  dob?: string;
  gender?: string;
}

// DOB values may come in different string formats — compare them by their
// canonical display form (MMM DD, YYYY) so equivalent dates aren't flagged.
const normalizeDob = (v: string | null | undefined): string => {
  const d = dayjs(v ?? "");
  return d.isValid() ? d.format(DATE_DISPLAY_FORMAT).toLowerCase() : normalize(v);
};

// Per-field match result for a report extract vs the patient record.
// Only name, mrn, dob and gender are compared (summary is never matched).
export const reportFieldMatches = (
  extracted: ReportExtractRecord,
  patient: ReportPatientRecord,
): { name: boolean; mrn: boolean; dob: boolean; gender: boolean } => {
  const name =
    normalize(extracted.patientName) !== "" &&
    normalize(patient.fullName) !== "" &&
    normalize(extracted.patientName) === normalize(patient.fullName);
  const mrn =
    normalize(extracted.mrn) !== "" &&
    normalize(patient.patientMrnNumber) !== "" &&
    normalize(extracted.mrn) === normalize(patient.patientMrnNumber);
  const dob =
    normalizeDob(extracted.dob) !== "" &&
    normalizeDob(patient.dateOfBirth) !== "" &&
    normalizeDob(extracted.dob) === normalizeDob(patient.dateOfBirth);
  const gender =
    normalize(extracted.gender) !== "" &&
    normalize(patient.gender) !== "" &&
    normalize(extracted.gender) === normalize(patient.gender);
  return { name, mrn, dob, gender };
};

export const reportFieldsMatch = (
  extracted: ReportExtractRecord,
  patient: ReportPatientRecord,
): boolean => {
  const r = reportFieldMatches(extracted, patient);
  return r.name && r.mrn && r.dob && r.gender;
};

// ─── Parallel Upload Helpers ───────────────────────────────────────────────────

export interface PrefixedFile {
  prefixedName: string;
  file: File;
}

// Derives the relative path for a file within the selected folder.
// Priority: FS Access API tracked path → webkitRelativePath (strips root segment) → bare filename.
const resolveRelativePath = (file: File): string => {
  const fsaPath = fsaFilePathMap.get(file);
  if (fsaPath) return fsaPath;
  const webkit = (file as any).webkitRelativePath as string | undefined;
  if (webkit) {
    // webkitRelativePath = "RootFolder/SERIES0/IMAGE001" — strip the root segment
    const parts = webkit.split("/");
    return parts.length > 1 ? parts.slice(1).join("/") : file.name;
  }
  return file.name;
};

/**
 * Flattens UploadEntry[] to individual files with S3-safe prefixed names.
 * FolderEntry → preserves series subfolder path (SERIES0/IMAGE001)
 * FileEntry   → bare filename (no artificial series0/ prefix)
 */
export const flattenEntriesToFiles = (entries: UploadEntry[]): PrefixedFile[] => {
  const result: PrefixedFile[] = [];
  for (const entry of entries) {
    if (entry.type === "folder") {
      for (const file of entry.files) {
        result.push({ prefixedName: resolveRelativePath(file), file });
      }
    } else {
      result.push({ prefixedName: resolveRelativePath(entry.file), file: entry.file });
    }
  }
  return result;
};

export interface UploadFileItem {
  fileId: string;
  s3Key: string;
  scanItemId: string;
}

export interface ParallelUploadAbortHandle {
  cancelled: boolean;
  xhrs: Set<XMLHttpRequest>;
}

export interface ParallelUploadOptions {
  onFileProgress?: (loaded: number, total: number, fileIndex: number) => void;
  onFileDone?: (fileIndex: number, success: boolean) => void;
  abortHandle?: ParallelUploadAbortHandle;
}

const UPLOAD_CONCURRENCY = 10;

/**
 * Uploads files to their presigned S3 URLs in parallel batches of UPLOAD_CONCURRENCY.
 * Returns completed file descriptors for the complete API call.
 * Throws on first failure.
 */
export const uploadFilesInParallel = async (
  presignedFiles: Array<{
    presignedUrl: string;
    fileId: string;
    s3Key: string;
    scanItemId: string;
    file: File;
  }>,
  options: ParallelUploadOptions = {},
): Promise<UploadFileItem[]> => {
  const { onFileProgress, onFileDone, abortHandle } = options;
  const completed: UploadFileItem[] = [];

  for (let i = 0; i < presignedFiles.length; i += UPLOAD_CONCURRENCY) {
    if (abortHandle?.cancelled) throw new Error("Upload cancelled");
    const batch = presignedFiles.slice(i, i + UPLOAD_CONCURRENCY);

    await Promise.all(
      batch.map((item, batchIdx) => {
        const globalIdx = i + batchIdx;
        return new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          abortHandle?.xhrs.add(xhr);

          xhr.open("PUT", item.presignedUrl);
          xhr.setRequestHeader("Content-Type", "application/octet-stream");

          xhr.upload.onprogress = (evt) => {
            if (!evt.lengthComputable) return;
            onFileProgress?.(evt.loaded, evt.total, globalIdx);
          };

          xhr.onabort = () => {
            abortHandle?.xhrs.delete(xhr);
            reject(new Error("Upload cancelled"));
          };

          xhr.onload = () => {
            abortHandle?.xhrs.delete(xhr);
            if (xhr.status >= 200 && xhr.status < 300) {
              completed.push({ fileId: item.fileId, s3Key: item.s3Key, scanItemId: item.scanItemId });
              onFileDone?.(globalIdx, true);
              resolve();
            } else {
              onFileDone?.(globalIdx, false);
              reject(new Error(`Failed to upload "${item.file.name}" — HTTP ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            abortHandle?.xhrs.delete(xhr);
            onFileDone?.(globalIdx, false);
            reject(new Error(`Network error uploading "${item.file.name}"`));
          };

          xhr.send(item.file);
        });
      }),
    );
  }

  return completed;
};

// ─── Pair Building ─────────────────────────────────────────────────────────────

export const buildPairsForScanItem = (
  scanItemId: string,
  entries: UploadEntry[],
): FilePair[] => {
  const pairs: FilePair[] = [];
  for (const entry of entries) {
    if (entry.type === "folder") {
      entry.files.forEach((f) => pairs.push({ file: f, scanItemId }));
    } else {
      pairs.push({ file: entry.file, scanItemId });
    }
  }
  return pairs;
};

// ─── Drag & Drop File Reading ──────────────────────────────────────────────────

export const readEntryRecursive = (
  entry: FileSystemEntry | null,
): Promise<File[]> => {
  if (!entry) return Promise.resolve([]);
  return new Promise((resolve) => {
    if (entry.isFile) {
      (entry as FileSystemFileEntry).file(
        (file) => resolve([file]),
        (err) => {
          console.warn("FileEntry.file() error:", entry.name, err);
          resolve([]);
        },
      );
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      const collected: File[] = [];
      const readBatch = () => {
        reader.readEntries(
          async (batchEntries) => {
            if (batchEntries.length === 0) {
              resolve(collected);
              return;
            }
            const nested = await Promise.all(
              batchEntries.filter(Boolean).map(readEntryRecursive),
            );
            collected.push(...nested.flat());
            readBatch();
          },
          (err) => {
            console.warn("readEntries error:", entry.name, err);
            resolve(collected);
          },
        );
      };
      readBatch();
    } else {
      resolve([]);
    }
  });
};

interface DroppedItem {
  kind: "folder" | "file";
  name: string;
  files: File[];
}

export const extractDroppedItems = async (
  dataTransfer: DataTransfer,
): Promise<DroppedItem[]> => {
  const items = dataTransfer.items;
  if (
    items &&
    items.length > 0 &&
    typeof items[0].webkitGetAsEntry === "function"
  ) {
    const snapshot: Array<FileSystemEntry | null> = [];
    for (let i = 0; i < items.length; i++)
      snapshot.push(items[i].webkitGetAsEntry());
    const results: DroppedItem[] = [];
    for (const entry of snapshot) {
      if (!entry) continue;
      const files = await readEntryRecursive(entry);
      results.push({
        kind: entry.isDirectory ? "folder" : "file",
        name: entry.name,
        files,
      });
    }
    if (results.length > 0) return results;
  }
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    return Array.from(dataTransfer.files).map((file) => ({
      kind: "file" as const,
      name: file.name,
      files: [file],
    }));
  }
  return [];
};
