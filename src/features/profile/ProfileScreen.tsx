import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { useDomainData } from '@/hooks/useDomainData';
import { useAuthStore } from '@/store/auth/authStore';
import { useFormsStore } from '@/store/dashboard/formsStore';
import { fmtLong } from '@/utils/format';

export function ProfileScreen() {
  const { people, providers } = useDomainData();
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const openAddFamily = useFormsStore((s) => s.openAddFamily);
  const openAddProvider = useFormsStore((s) => s.openAddProvider);

  const family = people.slice(1);

  const goLogin = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="wrap" style={{ maxWidth: 1080 }}>
      <div className="pagehd">
        <div>
          <div className="kicker">Your account</div>
          <div className="h1 serif" style={{ fontSize: 26 }}>
            Profile
          </div>
        </div>
      </div>

      <div
        className="pcard-hd"
        style={{
          background: 'var(--card)',
          border: '1.5px solid var(--line)',
          borderRadius: 20,
          padding: 26,
          marginBottom: 26,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div className="pcard-av">JD</div>
        <div>
          <div className="pcard-nm">John Doe</div>
          <div className="pcard-sub">+1 (248) 737-6695 · john.doe@example.com</div>
        </div>
      </div>

      <div className="psec">
        <div className="psec-h">
          <h4>My details</h4>
          <a className="psec-act">
            <Icon name="edit" />
            Edit
          </a>
        </div>
        <div className="pcard">
          <div className="kv-grid" style={{ borderTop: 'none' }}>
            <div className="dl2">
              <span className="plist-k">Full name</span>
              <span className="plist-v">John Doe</span>
            </div>
            <div className="dl2">
              <span className="plist-k">Date of birth</span>
              <span className="plist-v">March 14, 1979</span>
            </div>
            <div className="dl2">
              <span className="plist-k">Mobile</span>
              <span className="plist-v">+1 (248) 737-6695</span>
            </div>
            <div className="dl2">
              <span className="plist-k">Email</span>
              <span className="plist-v">john.doe@example.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="psec">
        <div className="psec-h">
          <h4>Family members</h4>
          <a className="psec-act" onClick={() => openAddFamily('profile')}>
            <Icon name="plus" sw={2.4} />
            Add
          </a>
        </div>
        <div className="pcard">
          <div className="pfam-grid">
            {family.map((p) => (
              <div key={p.id} className="pfam-row">
                <div className="pfam-av">{p.initials}</div>
                <div>
                  <div className="pfam-nm">{p.name}</div>
                  <div className="pfam-detail">
                    {p.role && <span>{p.role}</span>}
                    {p.sex && <span>{p.sex}</span>}
                    {p.dob && <span>DOB {fmtLong(p.dob)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="psec">
        <div className="psec-h">
          <h4>My doctors &amp; providers</h4>
          <a className="psec-act" onClick={openAddProvider}>
            <Icon name="plus" sw={2.4} />
            Add
          </a>
        </div>
        <div className="pcard">
          <div className="pfam-grid">
            {providers.map((p, i) => (
              <div key={i} className="pfam-row">
                <div className="pfam-av">{p.init}</div>
                <div>
                  <div className="pfam-nm">{p.name}</div>
                  <div className="pfam-detail">
                    <span>{p.spec}</span>
                  </div>
                  <div className="pdoc-contact">
                    <div className="pdoc-line">
                      {p.phone && (
                        <span className="pdoc-c">
                          <Icon name="phone" sw={1.8} />
                          {p.phone}
                        </span>
                      )}
                      {p.fax && (
                        <span className="pdoc-c">
                          <Icon name="fax" sw={1.8} />
                          {p.fax}
                        </span>
                      )}
                    </div>
                    {p.email && (
                      <div className="pdoc-line">
                        <span className="pdoc-c">
                          <Icon name="mail" sw={1.8} />
                          {p.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="help-strip">
        <Icon name="bulb" />
        <p>
          Family members and doctors you add are saved here, ready to reuse for future requests and
          shares.
        </p>
      </div>
      <button className="btn btn-ghost btn-block" onClick={goLogin} style={{ maxWidth: 340 }}>
        Sign out
      </button>
    </div>
  );
}
