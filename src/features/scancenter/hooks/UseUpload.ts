import { useState, useRef, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import {
  validateToken,
  scanuploadcomplete,
  scanMultipartInitiate,
  scanMultipartComplete,
  scanMultipartAbort,
  scanRevoke,
  scanMessage,
} from "@/redux/scancenter/action";
import { resetScanCenter } from "@/redux/scancenter/slice";
import type { RootState } from "../../../store/store";
import { useAppDispatch } from "@/store/hook";
import type {
  IScanTokenValidationRequest,
} from "@/redux/scancenter/types/request";
import { showAlert } from "@/components/common/showAlert";
import {
  extractDicomMetaFromEntries,
  checkMetaMatch,
  buildPairsForScanItem,
  extractDroppedItems,
  filterDicomFiles,
  groupDicomFilesBySubfolder,
  readDirectoryHandleFiles,
  flattenEntriesToFiles,
} from "../utils/Index";
import type {
  UploadEntry,
  UploadEntriesState,
  DragOverState,
  CardProgressMap,
  ScanItemUploadStateMap,
  ModalMode,
  PendingModal,
  UploadSessionMap,
  MultipartPart,
} from "../types/Index";
import type { DragEvent, ChangeEvent } from "react";

// 25 MB parts — resume snaps to the last completed part, so smaller parts mean
// resume lands closer to the exact disconnect point (S3 min part size is 5 MB).
const PART_SIZE = 25 * 1024 * 1024;
const CHUNK_SIZE_LIMIT = 500 * 1024 * 1024;

export const useUpload = (id: string | undefined) => {
  const dispatch = useAppDispatch();
  const { scancenterDetails } = useSelector(
    (state: RootState) => state.scanCenter,
  );

  const [loader, setLoader] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "done" | "error">(
    "idle",
  );
  const [uploadEntries, setUploadEntries] = useState<UploadEntriesState>({});
  const [dragOver, setDragOver] = useState<DragOverState>({});
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [pendingModal, setPendingModal] = useState<PendingModal | null>(null);
  const [cardProgress, setCardProgress] = useState<CardProgressMap>({});
  const [scanItemUploadState, setScanItemUploadState] =
    useState<ScanItemUploadStateMap>({});
  const [completing, setCompleting] = useState(false);
  const [sendingItems, setSendingItems] = useState<Record<string, boolean>>({});
  const [sentItems, setSentItems] = useState<Record<string, boolean>>({});
  // Items paused because the network dropped mid-upload (scanItemId → true).
  const [pausedItems, setPausedItems] = useState<Record<string, boolean>>({});
  // Whether to show the "resume or start new" popup after reconnecting.
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  const cardBytesRef = useRef<
    Record<string, { loaded: number; total: number }>
  >({});
  const fileBytesRef = useRef<Record<string, number>>({});
  const allGeneratedFilesRef = useRef<
    { fileId: string; s3Key: string; scanItemId: string }[]
  >([]);
  const allDoneRef = useRef(false);
  const cancelledRef = useRef<Record<string, boolean>>({});
  const readingRef = useRef<Record<string, boolean>>({});
  const activeXhrsRef = useRef<Record<string, XMLHttpRequest[]>>({});
  // Resumable upload sessions, kept alive across a network drop (scanItemId → session).
  const uploadSessionRef = useRef<UploadSessionMap>({});
  // Which items are currently paused (mirrors pausedItems state, readable synchronously).
  const pausedItemsRef = useRef<Record<string, boolean>>({});
  // True while the browser reports the network is offline.
  const offlineRef = useRef(false);

  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const folderInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Beforeunload guard ────────────────────────────────────────────────────

  const hasPaused = Object.values(pausedItems).some(Boolean);
  const isUploading =
    Object.values(scanItemUploadState).some((s) => s.uploading) || hasPaused;

  useEffect(() => {
    if (!isUploading) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isUploading]);

  // ── Pause / Network handling ──────────────────────────────────────────────

  // Pause an in-flight item: abort its live XHRs but keep the multipart session
  // (uploadId, completed parts, blob) alive so it can resume byte-for-byte.
  const pauseItem = useCallback((scanItemId: string) => {
    pausedItemsRef.current[scanItemId] = true;
    activeXhrsRef.current[scanItemId]?.forEach((x) => x.abort());
    activeXhrsRef.current[scanItemId] = [];
    setPausedItems((prev) => ({ ...prev, [scanItemId]: true }));
    setScanItemUploadState((prev) => ({
      ...prev,
      [scanItemId]: { ...prev[scanItemId], uploading: false },
    }));
  }, []);

  useEffect(() => {
    const handleOffline = () => {
      offlineRef.current = true;
      const activeIds = Object.keys(uploadSessionRef.current).filter(
        (sid) => !pausedItemsRef.current[sid],
      );
      if (activeIds.length === 0) return;
      activeIds.forEach(pauseItem);
      showAlert({
        message: "Network disconnected. Uploads have been paused. Reconnect to resume.",
        status: "error",
        autoClose: 15000,
      });
    };
    const handleOnline = () => {
      offlineRef.current = false;
      const paused = Object.keys(pausedItemsRef.current).filter(
        (sid) => pausedItemsRef.current[sid],
      );
      if (paused.length > 0) setResumeModalOpen(true);
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [pauseItem]);

  // ── Token Validation ─────────────────────────────────────────────────────

  const handleValidateError = useCallback((error: any) => {
    const statusCode = error?.headers?.statusCode ?? error?.statusCode ?? error?.status;
    if (statusCode === 500) {
      window.location.reload();
    } else {
      // 410 = expired or revoked; anything else = invalid link
      setUploadStatus("error");
    }
  }, []);

  const reValidate = useCallback(
    async (token: string) => {
      try {
        await dispatch(validateToken({ token })).unwrap();
      } catch (err: any) {
        handleValidateError(err);
      }
    },
    [dispatch, handleValidateError],
  );

  const { mutate: handleValidateToken } = useMutation({
    mutationFn: (payload: IScanTokenValidationRequest) =>
      dispatch(validateToken(payload)).unwrap(),
    onSuccess: () => setLoader(false),
    onError: (error: any) => {
      setLoader(false);
      handleValidateError(error);
    },
  });

  const initValidation = useCallback(() => {
    if (!id) return;
    // Reset Redux state so stale data from a previous visit is cleared
    dispatch(resetScanCenter());
    // Reset all local state
    setUploadStatus("idle");
    setUploadEntries({});
    setDragOver({});
    setModalMode(null);
    setPendingModal(null);
    setCardProgress({});
    setScanItemUploadState({});
    setCompleting(false);
    setSendingItems({});
    setSentItems({});
    setPausedItems({});
    setResumeModalOpen(false);
    cardBytesRef.current = {};
    fileBytesRef.current = {};
    allGeneratedFilesRef.current = [];
    allDoneRef.current = false;
    cancelledRef.current = {};
    readingRef.current = {};
    activeXhrsRef.current = {};
    uploadSessionRef.current = {};
    pausedItemsRef.current = {};
    offlineRef.current = false;
    setLoader(true);
    handleValidateToken({ token: id });
  }, [id]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const triggerValidationForScanItem = useCallback(
    async (scanItemId: string, newEntries: UploadEntry[]) => {
      if (!scancenterDetails) return;
      const pairs = buildPairsForScanItem(scanItemId, newEntries);
      if (!pairs.length) return;

      setModalMode("parsing");
      const meta = await extractDicomMetaFromEntries(newEntries);
      setPendingModal({ scanItemId, pairs, meta });

      if (!meta) {
        setModalMode("unverified");
        return;
      }

      const scanItem = scancenterDetails.scanItems?.find((s: any) => s.id === scanItemId);

      const matched = checkMetaMatch(meta, {
        fullName: scancenterDetails.fullName,
        patientId: scancenterDetails.patientId,
        scanType: scanItem?.scanType,
        bodyPart: scanItem?.bodyPoint,
      });
      setModalMode(matched ? "match" : "mismatch");
    },
    [scancenterDetails],
  );

  const addEntries = useCallback(
    (scanItemId: string, newEntries: UploadEntry[]): void => {
      if (!newEntries.length) return;
      setUploadEntries((prev) => ({
        ...prev,
        [scanItemId]: [...(prev[scanItemId] ?? []), ...newEntries],
      }));
      triggerValidationForScanItem(scanItemId, newEntries);
    },
    [triggerValidationForScanItem],
  );

  const removeEntry = useCallback((scanItemId: string, index: number): void => {
    setUploadEntries((prev) => ({
      ...prev,
      [scanItemId]: (prev[scanItemId] ?? []).filter((_, i) => i !== index),
    }));
  }, []);

  // ── Drag & File Handlers ──────────────────────────────────────────────────

  const handleDragEnter = (e: DragEvent<HTMLDivElement>, sid: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((p) => ({ ...p, [sid]: true }));
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>, sid: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((p) => ({ ...p, [sid]: true }));
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>, sid: string) => {
    e.preventDefault();
    e.stopPropagation();
    const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    if (
      e.clientX <= r.left ||
      e.clientX >= r.right ||
      e.clientY <= r.top ||
      e.clientY >= r.bottom
    ) {
      setDragOver((p) => ({ ...p, [sid]: false }));
    }
  };
  const handleDrop = async (e: DragEvent<HTMLDivElement>, sid: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((p) => ({ ...p, [sid]: false }));
    try {
      const dropped = await extractDroppedItems(e.dataTransfer);
      if (!dropped.length) {
        showAlert({ message: "No files found.", status: "error", autoClose: 4000 });
        return;
      }

      const newEntries: import("../types/Index").UploadEntry[] = [];

      for (const item of dropped) {
        const dicomFiles = await filterDicomFiles(item.files);
        if (!dicomFiles.length) continue;

        if (item.kind === "folder") {
          // Group DICOM files by immediate sub-folder
          const grouped = groupDicomFilesBySubfolder(dicomFiles, item.name);
          newEntries.push(...grouped);
        } else {
          newEntries.push({ type: "file", file: dicomFiles[0] });
        }
      }

      if (!newEntries.length) {
        showAlert({ message: "No DICOM files found in the dropped items.", status: "error", autoClose: 5000 });
        return;
      }

      addEntries(sid, newEntries);
    } catch {
      showAlert({ message: "Failed to read dropped files.", status: "error", autoClose: 6000 });
    }
  };

  const handleAreaClick = (sid: string) => fileInputRefs.current[sid]?.click();

  const openFolderPicker = async (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    // Firefox and other browsers that don't support the File System Access API
    if (typeof (window as any).showDirectoryPicker !== "function") {
      folderInputRefs.current[sid]?.click();
      return;
    }
    try {
      // @ts-ignore — showDirectoryPicker is standard but may not be typed in older lib versions
      const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker({ mode: "read" });
      readingRef.current[sid] = true;
      setCardProgress((prev) => ({ ...prev, [sid]: "reading" }));
      const allFiles = await readDirectoryHandleFiles(dirHandle);
      const dicomFiles = await filterDicomFiles(allFiles);
      readingRef.current[sid] = false;
      setCardProgress((prev) => ({ ...prev, [sid]: 0 }));
      if (!dicomFiles.length) {
        showAlert({ message: "No DICOM files found in the selected folder.", status: "error", autoClose: 5000 });
        return;
      }
      const grouped = groupDicomFilesBySubfolder(dicomFiles, dirHandle.name);
      addEntries(sid, grouped);
    } catch (err: any) {
      readingRef.current[sid] = false;
      setCardProgress((prev) => ({ ...prev, [sid]: 0 }));
      if (err?.name === "AbortError") return;
      showAlert({ message: "Could not open folder. Please try again.", status: "error", autoClose: 5000 });
    }
  };

  const handleFolderInputChange = async (
    e: ChangeEvent<HTMLInputElement>,
    sid: string,
  ) => {
    if (!e.target.files?.length) { e.target.value = ""; return; }
    readingRef.current[sid] = true;
    setCardProgress((prev) => ({ ...prev, [sid]: "reading" }));
    const allFiles = Array.from(e.target.files);
    const dicomFiles = await filterDicomFiles(allFiles);
    readingRef.current[sid] = false;
    setCardProgress((prev) => ({ ...prev, [sid]: 0 }));
    if (!dicomFiles.length) {
      showAlert({ message: "No DICOM files found in the selected folder.", status: "error", autoClose: 5000 });
      e.target.value = "";
      return;
    }
    // webkitRelativePath = "FolderName/subdir/file.dcm" — first segment is the root folder name
    const rootName = (allFiles[0] as any).webkitRelativePath?.split("/")[0] || allFiles[0].name;
    const grouped = groupDicomFilesBySubfolder(dicomFiles, rootName);
    addEntries(sid, grouped);
    e.target.value = "";
  };

  const handleCdDvdClick = openFolderPicker;
  const handleFolderFromPcClick = openFolderPicker;
  const handleAddFolderClick = openFolderPicker;

  const handleFileInputChange = async (
    e: ChangeEvent<HTMLInputElement>,
    sid: string,
  ) => {
    if (!e.target.files?.length) { e.target.value = ""; return; }
    const allFiles = Array.from(e.target.files);
    const dicomFiles = await filterDicomFiles(allFiles);
    if (!dicomFiles.length) {
      showAlert({ message: "No DICOM files found. Only .dcm / .dicom files (or extensionless DICOM) are accepted.", status: "error", autoClose: 5000 });
      e.target.value = "";
      return;
    }
    const entries: UploadEntry[] = dicomFiles.map((file) => ({ type: "file" as const, file }));
    addEntries(sid, entries);
    e.target.value = "";
  };

  const handleCloseModal = () => {
    if (pendingModal?.scanItemId) {
      setUploadEntries((prev) => ({ ...prev, [pendingModal.scanItemId]: [] }));
    }
    setModalMode(null);
    setPendingModal(null);
  };

  // ── S3 Upload ─────────────────────────────────────────────────────────────

  // Split the flattened files into ≤500MB buckets, each zipped into one multipart upload.
  const buildBuckets = (
    prefixedFiles: { prefixedName: string; file: File }[],
  ): { prefixedName: string; file: File }[][] => {
    const buckets: { prefixedName: string; file: File }[][] = [];
    let currentBucket: { prefixedName: string; file: File }[] = [];
    let currentBucketSize = 0;
    for (const fileObj of prefixedFiles) {
      if (currentBucketSize + fileObj.file.size > CHUNK_SIZE_LIMIT && currentBucket.length > 0) {
        buckets.push(currentBucket);
        currentBucket = [];
        currentBucketSize = 0;
      }
      currentBucket.push(fileObj);
      currentBucketSize += fileObj.file.size;
    }
    if (currentBucket.length > 0) buckets.push(currentBucket);
    return buckets;
  };

  // Clear all local traces of a finished/cancelled item.
  const clearItemState = (scanItemId: string) => {
    setCardProgress((prev) => {
      const next = { ...prev };
      delete next[scanItemId];
      return next;
    });
    Object.keys(cardBytesRef.current).forEach((k) => {
      if (k.startsWith(`${scanItemId}::`)) delete cardBytesRef.current[k];
    });
    Object.keys(fileBytesRef.current).forEach((k) => {
      if (k.startsWith(`${scanItemId}::`)) delete fileBytesRef.current[k];
    });
    delete uploadSessionRef.current[scanItemId];
    delete pausedItemsRef.current[scanItemId];
    setPausedItems((prev) => {
      const next = { ...prev };
      delete next[scanItemId];
      return next;
    });
  };

  // Entry point: builds a fresh resumable session and starts uploading.
  const performUpload = async (modal: PendingModal) => {
    const token = id;
    if (!token || !scancenterDetails) return;
    const { scanItemId } = modal;

    cancelledRef.current[scanItemId] = false;
    pausedItemsRef.current[scanItemId] = false;
    setPausedItems((prev) => ({ ...prev, [scanItemId]: false }));
    setModalMode(null);
    setPendingModal(null);

    setScanItemUploadState((prev) => ({
      ...prev,
      [scanItemId]: { uploading: true, done: false, generatedFiles: [] },
    }));

    // Reset progress to 0 — this also clears any stale "error" state (Req 2).
    setCardProgress((prev) => ({ ...prev, [scanItemId]: 0 }));

    const entries = uploadEntries[scanItemId] ?? [];

    // Flatten entries to individual files with prefixed names
    const prefixedFiles = flattenEntriesToFiles(entries);
    setFileCounts((prev) => ({ ...prev, [scanItemId]: prefixedFiles.length }));
    if (!prefixedFiles.length) {
      setScanItemUploadState((prev) => ({
        ...prev,
        [scanItemId]: { ...prev[scanItemId], uploading: false },
      }));
      return;
    }

    uploadSessionRef.current[scanItemId] = {
      modal,
      buckets: buildBuckets(prefixedFiles),
      bucketIndex: 0,
      blob: null,
      completedParts: new Set<number>(),
      loadedPct: 0,
    };

    await runUpload(scanItemId);
  };

  // Resumable upload loop — driven off the session, safe to call again to resume.
  const runUpload = async (scanItemId: string) => {
    const token = id;
    if (!token) return;
    const session = uploadSessionRef.current[scanItemId];
    if (!session) return;

    cancelledRef.current[scanItemId] = false;
    pausedItemsRef.current[scanItemId] = false;
    setScanItemUploadState((prev) => ({
      ...prev,
      [scanItemId]: { uploading: true, done: false, generatedFiles: [] },
    }));

    const { buckets } = session;

    try {
      while (session.bucketIndex < buckets.length) {
        const bIndex = session.bucketIndex;
        const bucket = buckets[bIndex];
        const isFinalChunk = bIndex === buckets.length - 1;

        if (cancelledRef.current[scanItemId]) return;

        try {
          // (Re)zip this bucket only if we don't already hold its blob.
          if (!session.blob) {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            for (const { prefixedName, file } of bucket) zip.file(prefixedName, file);
            session.blob = await zip.generateAsync({ type: "blob", streamFiles: false, compression: "STORE" });
          }
          const blob = session.blob;

          if (cancelledRef.current[scanItemId]) return;

          // Initiate a multipart upload for this bucket only if not already live.
          if (!session.uploadId) {
            const initResult = await dispatch(
              scanMultipartInitiate({
                token,
                totalSizeBytes: blob.size,
                partSizeBytes: PART_SIZE,
              }),
            ).unwrap();
            session.fileId = initResult.fileId;
            session.s3Key = initResult.s3Key;
            session.uploadId = initResult.uploadId;
            session.parts = initResult.parts;
            session.completedParts = new Set<number>();
          }

          const parts = session.parts!;
          const partSizeOf = (partNumber: number) => {
            const start = (partNumber - 1) * PART_SIZE;
            return Math.min(start + PART_SIZE, blob.size) - start;
          };

          // Progress tracking — completed parts count as fully loaded.
          const partLoaded: Record<number, number> = {};
          session.completedParts.forEach((pn) => {
            partLoaded[pn] = partSizeOf(pn);
          });
          const updateProgress = () => {
            const loaded = Object.values(partLoaded).reduce((s, b) => s + b, 0);
            const chunkProgress = Math.min(99, Math.round((loaded / blob.size) * 100));
            const pct = Math.min(
              99,
              Math.round((bIndex / buckets.length) * 100 + chunkProgress / buckets.length),
            );
            session.loadedPct = pct;
            setCardProgress((prev) => ({ ...prev, [scanItemId]: pct }));
          };
          updateProgress();

          const uploadPart = (part: MultipartPart) =>
            new Promise<void>((resolve, reject) => {
              if (cancelledRef.current[scanItemId]) {
                reject(new Error("Upload cancelled"));
                return;
              }
              if (!session.blob) { reject(new Error("Blob is null")); return; }
              const start = (part.partNumber - 1) * PART_SIZE;
              const chunk = session.blob.slice(start, Math.min(start + PART_SIZE, session.blob.size));
              const xhr = new XMLHttpRequest();
              if (!activeXhrsRef.current[scanItemId]) activeXhrsRef.current[scanItemId] = [];
              activeXhrsRef.current[scanItemId].push(xhr);
              xhr.open("PUT", part.presignedUrl);
              xhr.setRequestHeader("Content-Type", "application/zip");
              xhr.upload.onprogress = (evt) => {
                if (evt.lengthComputable) {
                  partLoaded[part.partNumber] = evt.loaded;
                  updateProgress();
                }
              };
              xhr.onload = () => {
                activeXhrsRef.current[scanItemId] = (activeXhrsRef.current[scanItemId] ?? []).filter((x) => x !== xhr);
                if (xhr.status >= 200 && xhr.status < 300) {
                  session.completedParts.add(part.partNumber);
                  partLoaded[part.partNumber] = partSizeOf(part.partNumber);
                  updateProgress();
                  resolve();
                } else if (xhr.status === 403) {
                  // Presigned URL expired — signal the caller to re-initiate this bucket.
                  const e: any = new Error(`Part ${part.partNumber} expired — HTTP 403`);
                  e.expired = true;
                  reject(e);
                } else {
                  reject(new Error(`Part ${part.partNumber} failed — HTTP ${xhr.status}`));
                }
              };
              xhr.onerror = () => {
                activeXhrsRef.current[scanItemId] = (activeXhrsRef.current[scanItemId] ?? []).filter((x) => x !== xhr);
                const e: any = new Error(`Network error on part ${part.partNumber}`);
                if (!navigator.onLine || offlineRef.current) e.offline = true;
                reject(e);
              };
              xhr.onabort = () => reject(new Error("Upload cancelled"));
              xhr.send(chunk);
            });

          // Upload only the parts that haven't completed yet, 4 at a time.
          const pendingParts = parts.filter((p) => !session.completedParts.has(p.partNumber));
          const CONCURRENCY = 4;
          for (let i = 0; i < pendingParts.length; i += CONCURRENCY) {
            if (cancelledRef.current[scanItemId]) return;
            await Promise.all(pendingParts.slice(i, i + CONCURRENCY).map(uploadPart));
          }

          if (cancelledRef.current[scanItemId]) return;

          if (isFinalChunk) {
            setCardProgress((prev) => ({ ...prev, [scanItemId]: "completing" }));
          }
          await dispatch(
            scanMultipartComplete({
              token,
              fileId: session.fileId!,
              s3Key: session.s3Key!,
              uploadId: session.uploadId!,
              isFinalChunk,
            }),
          ).unwrap();

          // Advance to the next bucket; drop this bucket's blob/session to free memory.
          session.bucketIndex += 1;
          session.blob = null;
          session.uploadId = undefined;
          session.parts = undefined;
          session.completedParts = new Set<number>();
        } catch (bucketErr: any) {
          if (cancelledRef.current[scanItemId]) return;

          // Network drop → pause and keep the session alive for resume.
          if (pausedItemsRef.current[scanItemId] || bucketErr?.offline || !navigator.onLine || offlineRef.current) {
            pauseItem(scanItemId);
            return;
          }

          // Presigned URLs expired → abort this bucket and re-initiate from its blob.
          if (bucketErr?.expired && session.uploadId && session.s3Key) {
            await dispatch(
              scanMultipartAbort({
                token,
                s3Key: session.s3Key,
                uploadId: session.uploadId,
                fileId: session.fileId,
              }),
            );
            activeXhrsRef.current[scanItemId]?.forEach((x) => x.abort());
            activeXhrsRef.current[scanItemId] = [];
            session.uploadId = undefined;
            session.parts = undefined;
            session.completedParts = new Set<number>();
            continue; // retry the same bucket
          }

          // Genuine error → abort multipart and bubble up.
          if (session.uploadId && session.s3Key) {
            dispatch(
              scanMultipartAbort({
                token,
                s3Key: session.s3Key,
                uploadId: session.uploadId,
                fileId: session.fileId,
              }),
            );
          }
          throw bucketErr;
        }
      }

      // All buckets uploaded.
      await reValidate(token);
      setCardProgress((prev) => ({ ...prev, [scanItemId]: "done" }));
      setScanItemUploadState((prev) => ({
        ...prev,
        [scanItemId]: { uploading: false, done: false, generatedFiles: [] },
      }));
      setUploadEntries((prev) => ({ ...prev, [scanItemId]: [] }));
      clearItemState(scanItemId);
    } catch (err: any) {
      if (cancelledRef.current[scanItemId] || pausedItemsRef.current[scanItemId]) return;
      console.error("performUpload error:", err);
      setScanItemUploadState((prev) => ({
        ...prev,
        [scanItemId]: { ...prev[scanItemId], uploading: false },
      }));
      setCardProgress((prev) => ({ ...prev, [scanItemId]: "error" }));
      delete uploadSessionRef.current[scanItemId];
      showAlert({
        message: err?.message ?? "Upload failed. Please try again.",
        status: "error",
        autoClose: 6000,
      });
    }
  };

  // ── Resume / Start-new after a network drop ────────────────────────────────

  const resumeAllPaused = () => {
    setResumeModalOpen(false);
    const paused = Object.keys(pausedItemsRef.current).filter((sid) => pausedItemsRef.current[sid]);
    paused.forEach((sid) => {
      pausedItemsRef.current[sid] = false;
      setPausedItems((prev) => ({ ...prev, [sid]: false }));
      runUpload(sid);
    });
  };

  const startNewAllPaused = () => {
    setResumeModalOpen(false);
    const token = id;
    const paused = Object.keys(pausedItemsRef.current).filter((sid) => pausedItemsRef.current[sid]);
    paused.forEach((sid) => {
      const session = uploadSessionRef.current[sid];
      if (token && session?.uploadId && session.s3Key) {
        dispatch(
          scanMultipartAbort({
            token,
            s3Key: session.s3Key,
            uploadId: session.uploadId,
            fileId: session.fileId,
          }),
        );
      }
      cancelUpload(sid);
    });
  };

  // ── Complete ──────────────────────────────────────────────────────────────

  const handleComplete = async () => {
    const token = id;
    if (!token) return;
    setCompleting(true);
    try {
      await dispatch(
        scanuploadcomplete({ token, files: allGeneratedFilesRef.current }),
      ).unwrap();
      // Stay on the upload page — allStudiesUploaded in the UI handles the completed state.
    } catch (err: any) {
      showAlert({
        message: err?.message ?? "Failed to complete upload.",
        status: "error",
        autoClose: 6000,
      });
    } finally {
      setCompleting(false);
    }
  };

  // ── Not our patient (revoke) ──────────────────────────────────────────────

  const revokeNotOurPatient = async (): Promise<boolean> => {
    const token = id;
    if (!token || !scancenterDetails) return false;
    const items = scancenterDetails.scanItems ?? [];
    setLoader(true);
    try {
      await Promise.all(
        items.map((item: any) =>
          dispatch(scanRevoke({ token, scanItemId: item.id })).unwrap(),
        ),
      );
      // Refresh scancenterDetails so the revoked/wrong-patient status is reflected in the UI.
      await reValidate(token);
      showAlert({
        message: "Marked as not your patient. The request has been revoked.",
        status: "success",
        autoClose: 5000,
      });
      return true;
    } catch (err: any) {
      showAlert({
        message: err?.message ?? "Failed to revoke the request. Please try again.",
        status: "error",
        autoClose: 6000,
      });
      return false;
    } finally {
      setLoader(false);
    }
  };

  // ── Text patient (message) ────────────────────────────────────────────────

  const sendPatientMessage = async (message: string): Promise<boolean> => {
    const token = id;
    if (!token || !message.trim()) return false;
    setLoader(true);
    try {
      await dispatch(scanMessage({ token, message: message.trim() })).unwrap();
      showAlert({
        message: "Message sent to patient",
        status: "success",
        autoClose: 5000,
      });
      return true;
    } catch (err: any) {
      showAlert({
        message: err?.message ?? "Failed to send the message. Please try again.",
        status: "error",
        autoClose: 6000,
      });
      return false;
    } finally {
      setLoader(false);
    }
  };

  // ── Per-Item Send ─────────────────────────────────────────────────────────

  const handleSendItem = async (scanItemId: string) => {
    const token = id;
    if (!token) return;
    setSendingItems((prev) => ({ ...prev, [scanItemId]: true }));
    try {
      const files = allGeneratedFilesRef.current.filter(
        (f) => f.scanItemId === scanItemId,
      );
      await dispatch(scanuploadcomplete({ token, files })).unwrap();
      setSentItems((prev) => ({ ...prev, [scanItemId]: true }));

      // Re-validate to refresh scancenterDetails in Redux store
      await reValidate(token);

      // Reset local state for this item after validate
      setScanItemUploadState((prev) => ({
        ...prev,
        [scanItemId]: { uploading: false, done: false, generatedFiles: [] },
      }));
      setUploadEntries((prev) => ({ ...prev, [scanItemId]: [] }));
      setCardProgress((prev) => {
        const next = { ...prev };
        delete next[scanItemId];
        return next;
      });
      Object.keys(cardBytesRef.current).forEach((k) => {
        if (k.startsWith(`${scanItemId}::`)) delete cardBytesRef.current[k];
      });
      Object.keys(fileBytesRef.current).forEach((k) => {
        if (k.startsWith(`${scanItemId}::`)) delete fileBytesRef.current[k];
      });
      allGeneratedFilesRef.current = allGeneratedFilesRef.current.filter(
        (f) => f.scanItemId !== scanItemId,
      );
    } catch (err: any) {
      showAlert({
        message: err?.message ?? "Failed to send upload.",
        status: "error",
        autoClose: 6000,
      });
    } finally {
      setSendingItems((prev) => ({ ...prev, [scanItemId]: false }));
    }
  };

  // ── Cancel Upload ─────────────────────────────────────────────────────────

  const cancelUpload = useCallback((scanItemId: string) => {
    cancelledRef.current[scanItemId] = true;
    pausedItemsRef.current[scanItemId] = false;
    activeXhrsRef.current[scanItemId]?.forEach(x => x.abort());
    activeXhrsRef.current[scanItemId] = [];
    delete uploadSessionRef.current[scanItemId];
    setPausedItems((prev) => {
      const next = { ...prev };
      delete next[scanItemId];
      return next;
    });
    setScanItemUploadState((prev) => ({
      ...prev,
      [scanItemId]: { uploading: false, done: false, generatedFiles: [] },
    }));
    setCardProgress((prev) => {
      const next = { ...prev };
      delete next[scanItemId];
      return next;
    });
    Object.keys(cardBytesRef.current).forEach((k) => {
      if (k.startsWith(`${scanItemId}::`)) delete cardBytesRef.current[k];
    });
    Object.keys(fileBytesRef.current).forEach((k) => {
      if (k.startsWith(`${scanItemId}::`)) delete fileBytesRef.current[k];
    });
    allGeneratedFilesRef.current = allGeneratedFilesRef.current.filter(
      (f) => f.scanItemId !== scanItemId,
    );
    setUploadEntries((prev) => ({ ...prev, [scanItemId]: [] }));
  }, []);

  return {
    // state
    loader,
    uploadStatus,
    uploadEntries,
    dragOver,
    modalMode,
    pendingModal,
    cardProgress,
    fileCounts,
    scanItemUploadState,
    completing,
    sendingItems,
    sentItems,
    pausedItems,
    resumeModalOpen,
    scancenterDetails,
    // refs
    fileInputRefs,
    folderInputRefs,
    reValidate,
    // actions
    initValidation,
    addEntries,
    removeEntry,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAreaClick,
    handleAddFolderClick,
    handleCdDvdClick,
    handleFolderFromPcClick,
    handleFileInputChange,
    handleFolderInputChange,
    handleCloseModal,
    performUpload,
    handleComplete,
    handleSendItem,
    revokeNotOurPatient,
    sendPatientMessage,
    cancelUpload,
    resumeAllPaused,
    startNewAllPaused,
  };
};
