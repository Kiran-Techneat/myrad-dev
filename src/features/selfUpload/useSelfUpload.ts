import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import {
  initUploadFile,
  uploadFileDataExtract,
  generateReportUploadFile,
  initSelfMultipartUpload,
  completeSelfMultipartUpload,
  abortSelfMultipartUpload,
} from '@/redux/myfiles/action';
import { resetUploadExtract } from '@/redux/myfiles/slice';
import { showAlert } from '@/components/common/showAlert';

/** Study metadata captured by the wizard, passed into the upload flow. */
export interface StudyMeta {
  patientId: string;
  fullName: string;
  description: string;
  scanType: string;
  bodyPart: string;
}

interface UseSelfUploadArgs {
  /** Fired once a study (DICOM and/or report) is fully committed. */
  onDone: () => void;
}

/** DICOM files are zipped in buckets no larger than this before multipart upload. */
const CHUNK_SIZE_LIMIT = 500 * 1024 * 1024; // 500 MB
/** Multipart part size requested from the backend. */
const PART_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
/** Concurrent part PUTs in flight. */
const CONCURRENCY = 4;

/**
 * Orchestrates real self-uploads for the wizard:
 *  - DICOM: zip files into <=500MB buckets and multipart-upload each zip.
 *  - Report: extract details for preview, then commit on confirm.
 *  - Network: pause in-flight parts on disconnect and resume on reconnect.
 *
 * All UI (wizard cards, modals) lives in the screen; this hook only exposes
 * state + actions so the existing UI is reused unchanged.
 */
export function useSelfUpload({ onDone }: UseSelfUploadArgs) {
  const dispatch = useAppDispatch();
  const reportUploadExtractResponse = useAppSelector((s) => s.myfiles.reportUploadExtractResponse);

  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [pendingReport, setPendingReport] = useState<{ linkId: string; scanItemId: string; files: File[] } | null>(null);

  const cancelledRef = useRef(false);
  const activeXhrsRef = useRef<XMLHttpRequest[]>([]);
  const pendingAbortRef = useRef<{ s3Key: string; uploadId: string; fileId: string; linkId: string } | null>(null);

  // Network disconnect/resume handling.
  const offlineRef = useRef(false);
  const pausedRef = useRef(false);

  // Everything needed to continue a DICOM multipart upload from where it stopped.
  const sessionRef = useRef<{
    linkId: string;
    scanItemId: string;
    reportFiles: File[]; // report files to attach after DICOM finishes (unused by wizard, kept for parity)
    buckets: File[][];
    bucketIndex: number;
    partSize: number;
    blob: Blob | null;
    fileId: string;
    s3Key: string;
    uploadId: string;
    parts: { partNumber: number; presignedUrl: string }[];
    completedParts: Set<number>;
  } | null>(null);

  const resetUploadState = () => {
    activeXhrsRef.current.forEach((x) => x.abort());
    activeXhrsRef.current = [];
    sessionRef.current = null;
    pausedRef.current = false;
    setPaused(false);
    setLoading(false);
    setZipping(false);
    setUploadProgress(null);
  };

  const cancel = () => {
    cancelledRef.current = true;
    if (pendingAbortRef.current) {
      dispatch(abortSelfMultipartUpload(pendingAbortRef.current));
      pendingAbortRef.current = null;
    }
    resetUploadState();
  };

  // Network dropped mid-upload: stop in-flight parts but keep the multipart session alive to resume.
  const pause = () => {
    pausedRef.current = true;
    activeXhrsRef.current.forEach((x) => x.abort());
    activeXhrsRef.current = [];
    setPaused(true);
  };

  // Pause in-flight uploads on network drop; prompt to resume once the connection returns.
  useEffect(() => {
    const handleOffline = () => {
      offlineRef.current = true;
      if (sessionRef.current && !pausedRef.current) {
        pause();
        showAlert({
          message: 'Network disconnected. Upload paused. Reconnect to resume.',
          status: 'error',
          autoClose: 15000,
        });
      }
    };
    const handleOnline = () => {
      offlineRef.current = false;
      if (pausedRef.current) setResumeModalOpen(true);
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const fail = (err: any) => {
    if (!cancelledRef.current && !pausedRef.current) {
      const message = err?.headers?.message || err?.message || 'Upload failed. Please try again.';
      showAlert({ message, status: 'error', autoClose: 6000 });
      sessionRef.current = null;
      setLoading(false);
    }
    setZipping(false);
  };

  // ── DICOM: zip + bucket + multipart ──────────────────────────────────────
  const startDicomUpload = async (meta: StudyMeta, files: File[]) => {
    if (!files.length) return;
    cancelledRef.current = false;
    activeXhrsRef.current = [];
    pendingAbortRef.current = null;
    pausedRef.current = false;
    setPaused(false);
    setLoading(true);
    setUploadProgress(null);
    try {
      const initResult = await dispatch(
        initUploadFile({
          uploadType: 'dicom',
          patientId: meta.patientId,
          fullName: meta.fullName,
          description: meta.description,
          scanItems: [{ scanType: meta.scanType, bodyPart: meta.bodyPart }],
        }),
      ).unwrap();

      const linkId = initResult.linkId;
      const scanItemId = initResult.scanItems?.[0]?.id;
      if (!scanItemId) throw new Error('Upload could not be initialised.');

      // Split DICOM files into <=500MB buckets up front so the upload can be paused/resumed.
      const buckets: File[][] = [];
      let currentBucket: File[] = [];
      let currentBucketSize = 0;
      for (const file of files) {
        if (currentBucketSize + file.size > CHUNK_SIZE_LIMIT && currentBucket.length > 0) {
          buckets.push(currentBucket);
          currentBucket = [];
          currentBucketSize = 0;
        }
        currentBucket.push(file);
        currentBucketSize += file.size;
      }
      if (currentBucket.length > 0) buckets.push(currentBucket);

      sessionRef.current = {
        linkId,
        scanItemId,
        reportFiles: [],
        buckets,
        bucketIndex: 0,
        partSize: PART_SIZE_BYTES,
        blob: null,
        fileId: '',
        s3Key: '',
        uploadId: '',
        parts: [],
        completedParts: new Set<number>(),
      };

      await runUpload();
    } catch (err: any) {
      fail(err);
    }
  };

  // Drives the DICOM multipart upload from sessionRef; safe to re-invoke to resume after a network drop.
  const runUpload = async () => {
    const session = sessionRef.current;
    if (!session) return;
    const { linkId, scanItemId, buckets, partSize } = session;
    setLoading(true);
    if (buckets.length > 0 && uploadProgress === null) setUploadProgress(0);

    try {
      for (let i = session.bucketIndex; i < buckets.length; i++) {
        session.bucketIndex = i;
        const bucket = buckets[i];
        const isFinalChunk = i === buckets.length - 1;

        // Zip + init multipart only for a fresh bucket; on resume the existing blob/session is reused.
        if (!session.blob) {
          setZipping(true);
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          for (const file of bucket) {
            const relativePath = (file as any).webkitRelativePath as string | undefined;
            const zipPath = relativePath ? relativePath.split('/').slice(1).join('/') : file.name;
            zip.file(zipPath || file.name, file);
          }
          session.blob = await zip.generateAsync({ type: 'blob', streamFiles: false, compression: 'STORE' });
          setZipping(false);

          if (cancelledRef.current) return;
          if (pausedRef.current || offlineRef.current || !navigator.onLine) {
            pause();
            return;
          }

          const multipartInitResult = await dispatch(
            initSelfMultipartUpload({
              linkId,
              scanItemId,
              totalSizeBytes: session.blob!.size,
              partSizeBytes: partSize,
            }),
          ).unwrap();

          session.fileId = multipartInitResult.fileId;
          session.s3Key = multipartInitResult.s3Key;
          session.uploadId = multipartInitResult.uploadId;
          session.parts = multipartInitResult.parts;
          session.completedParts = new Set<number>();
        }

        if (cancelledRef.current) return;

        pendingAbortRef.current = { s3Key: session.s3Key, uploadId: session.uploadId, fileId: session.fileId, linkId };
        const blob = session.blob!;
        const parts = session.parts;

        try {
          const partLoaded = new Array<number>(parts.length).fill(0);
          // Account for already-uploaded parts so resumed progress doesn't jump backwards.
          for (const pn of session.completedParts) {
            const start = (pn - 1) * partSize;
            partLoaded[pn - 1] = Math.min(start + partSize, blob.size) - start;
          }

          const uploadPart = (part: { partNumber: number; presignedUrl: string }) =>
            new Promise<void>((resolve, reject) => {
              if (session.completedParts.has(part.partNumber)) {
                resolve();
                return;
              }
              if (cancelledRef.current) {
                reject(new Error('Upload cancelled'));
                return;
              }
              const start = (part.partNumber - 1) * partSize;
              const chunk = blob.slice(start, Math.min(start + partSize, blob.size));
              const xhr = new XMLHttpRequest();
              activeXhrsRef.current.push(xhr);
              xhr.open('PUT', part.presignedUrl);
              xhr.setRequestHeader('Content-Type', 'application/zip');
              xhr.upload.onprogress = (evt) => {
                if (evt.lengthComputable) {
                  partLoaded[part.partNumber - 1] = evt.loaded;
                  const chunkProgress = Math.min(99, Math.round((partLoaded.reduce((s, b) => s + b, 0) / blob.size) * 100));
                  setUploadProgress(Math.min(99, Math.round((i / buckets.length) * 100 + chunkProgress / buckets.length)));
                }
              };
              xhr.onload = () => {
                activeXhrsRef.current = activeXhrsRef.current.filter((x) => x !== xhr);
                if (xhr.status >= 200 && xhr.status < 300) {
                  session.completedParts.add(part.partNumber);
                  resolve();
                } else {
                  reject(new Error(`Part ${part.partNumber} failed — HTTP ${xhr.status}`));
                }
              };
              xhr.onerror = () => {
                activeXhrsRef.current = activeXhrsRef.current.filter((x) => x !== xhr);
                const e: any = new Error(`Network error on part ${part.partNumber}`);
                if (!navigator.onLine || offlineRef.current) e.offline = true;
                reject(e);
              };
              xhr.onabort = () => reject(new Error('Upload cancelled'));
              xhr.send(chunk);
            });

          for (let p = 0; p < parts.length; p += CONCURRENCY) {
            if (cancelledRef.current) return;
            if (pausedRef.current || offlineRef.current || !navigator.onLine) {
              pause();
              return;
            }
            await Promise.all(parts.slice(p, p + CONCURRENCY).map(uploadPart));
          }
        } catch (partErr: any) {
          if (cancelledRef.current) return;
          // Network drop → pause and keep the multipart session alive for resume.
          if (pausedRef.current || partErr?.offline || offlineRef.current || !navigator.onLine) {
            pause();
            return;
          }
          dispatch(abortSelfMultipartUpload({ s3Key: session.s3Key, uploadId: session.uploadId, fileId: session.fileId, linkId }));
          throw partErr;
        }

        if (cancelledRef.current) return;
        if (pausedRef.current || offlineRef.current || !navigator.onLine) {
          pause();
          return;
        }

        pendingAbortRef.current = null;
        await dispatch(
          completeSelfMultipartUpload({
            linkId,
            fileId: session.fileId,
            s3Key: session.s3Key,
            scanItemId,
            uploadId: session.uploadId,
            isFinalChunk,
          }),
        ).unwrap();

        // Bucket done — clear per-bucket state so the next bucket zips + inits fresh.
        session.blob = null;
        session.completedParts = new Set<number>();
      }

      if (buckets.length > 0) setUploadProgress(100);

      sessionRef.current = null;
      setLoading(false);
      onDone();
    } catch (err: any) {
      fail(err);
    }
  };

  // ── Report: extract for preview, commit on confirm ───────────────────────
  const startReportUpload = async (meta: StudyMeta, files: File[]) => {
    if (!files.length) return;
    cancelledRef.current = false;
    setLoading(true);
    try {
      const initResult = await dispatch(
        initUploadFile({
          uploadType: 'report',
          patientId: meta.patientId,
          fullName: meta.fullName,
          description: meta.description,
          scanItems: [{ scanType: meta.scanType, bodyPart: meta.bodyPart }],
        }),
      ).unwrap();

      const linkId = initResult.linkId;
      const scanItemId = initResult.scanItems?.[0]?.id;
      if (!scanItemId) throw new Error('Upload could not be initialised.');

      await dispatch(uploadFileDataExtract({ linkId, scanItemId, files })).unwrap();
      // slice fills reportUploadExtractResponse → modal opens; commit deferred to confirm.
      setPendingReport({ linkId, scanItemId, files });
      setLoading(false);
    } catch (err: any) {
      fail(err);
    }
  };

  const confirmReport = async () => {
    if (!pendingReport) return;
    setReportUploading(true);
    try {
      await dispatch(generateReportUploadFile(pendingReport)).unwrap();
      dispatch(resetUploadExtract());
      setPendingReport(null);
      onDone();
    } catch (err: any) {
      const message = err?.headers?.message || err?.message || 'Upload failed. Please try again.';
      showAlert({ message, status: 'error', autoClose: 6000 });
    } finally {
      setReportUploading(false);
    }
  };

  const cancelExtract = () => {
    dispatch(resetUploadExtract());
    setPendingReport(null);
    setLoading(false);
  };

  // ── Reconnect prompt ─────────────────────────────────────────────────────
  const resume = () => {
    setResumeModalOpen(false);
    pausedRef.current = false;
    setPaused(false);
    runUpload();
  };

  const startNew = () => {
    setResumeModalOpen(false);
    const session = sessionRef.current;
    if (session?.uploadId && session.s3Key) {
      dispatch(
        abortSelfMultipartUpload({
          s3Key: session.s3Key,
          uploadId: session.uploadId,
          fileId: session.fileId,
          linkId: session.linkId,
        }),
      );
    }
    cancelledRef.current = true;
    pendingAbortRef.current = null;
    resetUploadState();
  };

  // Busy = anything that should keep the wizard out of its editable form state.
  const busy = loading || reportUploading || !!reportUploadExtractResponse;

  return {
    // state
    busy,
    paused,
    zipping,
    uploadProgress,
    reportUploading,
    reportUploadExtractResponse,
    resumeModalOpen,
    // actions
    startDicomUpload,
    startReportUpload,
    confirmReport,
    cancelExtract,
    cancel,
    resume,
    startNew,
  };
}
