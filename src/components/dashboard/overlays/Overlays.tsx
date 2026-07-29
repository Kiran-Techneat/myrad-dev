import { GetSheet } from './GetSheet';
import { ShareModal } from './ShareModal';
import { ShareConfirmModal } from './ShareConfirmModal';
import { NoticeModal } from '@/components/common/NoticeModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { AddProviderModal } from './AddProviderModal';
import { AddFamilyModal } from './AddFamilyModal';
import { AddCenterModal } from './AddCenterModal';
import { ReportModal } from './ReportModal';
import { ImageDetailModal } from '@/features/images/ImageDetailModal';

/** All globally-mounted modal/overlay layers. */
export function Overlays() {
  return (
    <>
      <GetSheet />
      <ImageDetailModal />
      <ShareModal />
      <ShareConfirmModal />
      <AddProviderModal />
      <AddFamilyModal />
      <AddCenterModal />
      <ReportModal />
      <NoticeModal />
      <ConfirmModal />
    </>
  );
}
