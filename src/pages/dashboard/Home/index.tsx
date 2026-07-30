import { Icon } from '@/components/common/Icon';
import { StudyIcon } from '@/components/common/StudyIcon';
import { Skeleton } from '@/components/common/Skeleton';
import { useEffect } from 'react';
import { useDomainData } from '@/hooks/useDomainData';
import { useMyStudies } from '@/hooks/useMyStudies';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { useOpenShare } from '@/hooks/useOpenShare';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getdashboardcount } from '@/redux/myfiles/action';
import { getRequestDashboard } from '@/redux/request/action';
import type { Study } from '@/types';
import styles from './home.module.scss';

/** Today's date, e.g. "Friday, July 24, 2026". */
function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Time-of-day greeting prefix. */
function getGreeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen() {
  const { showingAllPatients, patientMatches, activePatient } = useDomainData();
  const { studies } = useMyStudies(); // live API; auto-loads on mount when store is empty
  const dispatch = useAppDispatch();
  const dashboardcount = useAppSelector((s) => s.myfiles.dashboardcount);
  const requestDashboard = useAppSelector((s) => s.request.requestDashboard);
  const nav = useAppNavigate();
  const openGetSheet = useDialogStore((s) => s.openGetSheet);
  const { shareStudy } = useOpenShare();
  const userProfile = useAppSelector((s) => s.user.userProfile);
  const loading = useAppSelector((s) => s.user.loading);

  useEffect(() => {
    dispatch(getdashboardcount());
    dispatch(getRequestDashboard());
  }, [dispatch]);

  // Dashboard list uses the same live API as the /images screen (max 4 shown).
  const apiReadyStudies = studies.filter(
    (x) => x.status === 'ready' && patientMatches(x.patient),
  );
  const homeReady = apiReadyStudies.slice(0, 4);

  // Stat-card counts from the real API, scoped to the selected patient when one is active.
  const selectedPatientId = activePatient !== 'all' ? activePatient : undefined;
  const isFiltered = !!selectedPatientId;
  const patientFileCounts = isFiltered
    ? dashboardcount?.recordInfo?.byPatient?.[selectedPatientId]
    : undefined;
  const patientRequestCounts = isFiltered
    ? requestDashboard?.byPatient?.[selectedPatientId]
    : undefined;

  const myImagesCount = isFiltered
    ? patientFileCounts?.myImages ?? 0
    : dashboardcount?.recordInfo?.myImages ?? 0;
  const myRequestCount = isFiltered
    ? patientRequestCounts?.myRequest ?? 0
    : requestDashboard?.myRequest ?? 0;

  const greetName = userProfile?.firstName ?? '';

  const openViewer = (x: Study) =>
    nav.openViewer({ from: 'home', studyId: x.id, tab: x.hasImages === false ? 'report' : 'images' });

  if (loading || !userProfile) {
    return (
      <div className="wrap">
        <div className="pagehd">
          <div>
            <Skeleton block width={180} height={13} style={{ marginBottom: 10 }} />
            <Skeleton block width={280} height={30} radius={8} />
          </div>
        </div>

        <Skeleton block height={120} radius={18} style={{ marginBottom: 22 }} />

        <div className={styles["stat-row"]} style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Skeleton block height={90} radius={15} />
          <Skeleton block height={90} radius={15} />
        </div>

        <Skeleton block width={220} height={18} radius={6} style={{ margin: '24px 0 14px' }} />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} block height={64} radius={14} style={{ marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="pagehd">
        <div>
          <div className="kicker">{formatToday()}</div>
          <div className="h1 serif">
            {getGreeting()}
            {greetName && <>, <em>{greetName}</em></>}
          </div>
        </div>
      </div>

      <div className={styles.hero} onClick={openGetSheet} style={{ cursor: 'pointer' }}>
        <div>
          <h3>Get my images</h3>
          <p>Request studies from a center, or upload your own from a CD or DVD.</p>
          <button
            className="btn"
            style={{ marginTop: 10 }}
            onClick={(e) => {
              e.stopPropagation();
              openGetSheet();
            }}
          >
            Start Request →
          </button>
        </div>
      </div>

      <div className={styles["stat-row"]} style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className={styles.stat} onClick={() => nav.go('images')} style={{ cursor: 'pointer' }}>
          <div className={styles["stat-top"]}>
            <div className={styles["stat-ico"]}>
              <Icon name="image" />
            </div>
            <div className={styles["stat-num"]}>{myImagesCount}</div>
          </div>
          <div className={styles["stat-lbl"]}>My Images</div>
        </div>
        <div className={styles.stat} onClick={() => nav.go('requests')} style={{ cursor: 'pointer' }}>
          <div className={styles["stat-top"]}>
            <div className={styles["stat-ico"]}>
              <Icon name="clipboard" />
            </div>
            <div className={styles["stat-num"]}>{myRequestCount}</div>
          </div>
          <div className={styles["stat-lbl"]}>My Requests</div>
        </div>
      </div>

      <div className="sec-hd">
        <h4>Images Ready to View &amp; Share</h4>
        <a onClick={() => nav.go('images')}>See all →</a>
      </div>
      <div className="sec-note">
        <Icon name="calendar" />
        Dates shown are when each study was performed.
      </div>

      {homeReady.map((s) => (
        <div key={s.id} className="study img-row" onClick={() => openViewer(s)}>
          <div className="study-ico">
            <StudyIcon tag={s.tag} />
          </div>
          <div className="study-bd">
            <div className="study-nm">
              {s.name}
              {s.selfUploaded && <span className="self-badge">Self-uploaded</span>}
            </div>
            <div className="study-sub">
              {s.place} · {s.date}
              {showingAllPatients && ` · ${s.patient}`}
            </div>
          </div>
          <div className="study-acts">
            <button
              className="study-btn"
              onClick={(e) => {
                e.stopPropagation();
                openViewer(s);
              }}
            >
              <Icon name="eye" />
              View
            </button>
            <button
              className="study-btn"
              onClick={(e) => {
                e.stopPropagation();
                shareStudy(s);
              }}
            >
              <Icon name="share" />
              Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
