import { useShareStore } from '@/store/shareStore';
import type { ShareItem } from '@/store/shareStore';
import type { Study } from '@/types';

/** Helpers that open the share sheet pre-filled the same way the original app did. */
export function useOpenShare() {
  const openShare = useShareStore((s) => s.openShare);

  const shareStudy = (x: Study) => {
    const repOk = x.reportStatus === 'ready';
    const hasImg = x.hasImages !== false;
    openShare({
      studyName: x.name,
      meta: [x.patient, x.date, x.place].filter(Boolean).join(' · '),
      items: [
        { id: x.id, name: x.name, patient: x.patient, images: hasImg, report: repOk, reportAvailable: repOk },
      ],
    });
  };

  const shareStudies = (list: Study[]) => {
    const names = list.map((x) => x.name);
    const items: ShareItem[] = list.map((x) => {
      const repOk = x.reportStatus === 'ready';
      return { id: x.id, name: x.name, patient: x.patient, images: true, report: repOk, reportAvailable: repOk };
    });
    openShare({
      studyName: names.length > 1 ? `${names.length} studies` : names[0] || '',
      meta: '',
      items,
    });
  };

  return { shareStudy, shareStudies, openShare };
}
