import { Icon } from '@/components/common/Icon';
import { StudyIcon } from '@/components/common/StudyIcon';
import { useDomainData } from '@/hooks/useDomainData';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { useOpenShare } from '@/hooks/useOpenShare';
import type { Study } from '@/types';
import styles from './home.module.scss';

export function HomeScreen() {
  const { allStudies, requests, activePatientObj, showingAllPatients, patientMatches } = useDomainData();
  const nav = useAppNavigate();
  const openGetSheet = useDialogStore((s) => s.openGetSheet);
  const { shareStudy } = useOpenShare();

  const readyStudies = allStudies.filter((x) => x.status === 'ready' && patientMatches(x.patient));
  const homeReady = readyStudies.slice(0, 4);
  const requestsInProgress = requests.filter(
    (r) => (r.status === 'pending' || r.status === 'partial') && patientMatches(r.patient),
  ).length;

  const greetName = activePatientObj ? activePatientObj.name.split(' ')[0] : 'John';

  const openViewer = (x: Study) =>
    nav.openViewer({ from: 'home', studyId: x.id, tab: x.hasImages === false ? 'report' : 'images' });

  return (
    <div className="wrap">
      <div className="pagehd">
        <div>
          <div className="kicker">Tuesday, June 30, 2026</div>
          <div className="h1 serif">
            Good evening, <em>{greetName}</em>
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
            <div className={styles["stat-num"]}>{readyStudies.length}</div>
          </div>
          <div className={styles["stat-lbl"]}>Images ready to view</div>
        </div>
        <div className={styles.stat} onClick={() => nav.go('requests')} style={{ cursor: 'pointer' }}>
          <div className={styles["stat-top"]}>
            <div className={styles["stat-ico"]}>
              <Icon name="clipboard" />
            </div>
            <div className={styles["stat-num"]}>{requestsInProgress}</div>
          </div>
          <div className={styles["stat-lbl"]}>Requests in progress</div>
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
