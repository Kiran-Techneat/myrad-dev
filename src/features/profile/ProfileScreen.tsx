import { useRef, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { useDomainData } from '@/hooks/useDomainData';
import { useFormsStore } from '@/store/dashboard/formsStore';
import { fmtLong, formatUSPhone } from '@/utils/format';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { changeProfilePic, deleteFamilyMember, getUserProfile } from '@/redux/user/action';
import { showAlert } from '@/components/common/showAlert';
import { clearSession } from '@/utils/authUtility';
import type { IFamilyMember } from '@/redux/user/types/response';
import { EditProfileModal } from './EditProfileModal';
import { ContactChangeModal } from './ContactChangeModal';

const REL_OPTIONS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Grandchild', 'Guardian', 'Other'];

const initials = (first?: string, last?: string) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '—';

export function ProfileScreen() {
  const { providers } = useDomainData();
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector((s) => s.user.userProfile);
  const openAddFamily = useFormsStore((s) => s.openAddFamily);
  const openEditFamily = useFormsStore((s) => s.openEditFamily);
  const openAddProvider = useFormsStore((s) => s.openAddProvider);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [contact, setContact] = useState<{ open: boolean; type: 'email' | 'phone' }>({ open: false, type: 'email' });
  const [deleteTarget, setDeleteTarget] = useState<{ memberId: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const family = userProfile?.familyMembers ?? [];
  const fullName = `${userProfile?.firstName ?? ''} ${userProfile?.lastName ?? ''}`.trim() || '—';

  const signOut = () => clearSession();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      showAlert({ message: 'Only PNG, JPG, and JPEG files are allowed.', status: 'error', autoClose: 6000 });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showAlert({ message: 'File size must not exceed 2MB.', status: 'error', autoClose: 6000 });
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);
    setUploading(true);
    try {
      await dispatch(changeProfilePic(formData)).unwrap();
      showAlert({ message: 'Profile picture changed successfully', status: 'success', autoClose: 6000 });
      dispatch(getUserProfile());
    } catch (error: any) {
      showAlert({ message: error?.message || 'Failed to update picture', status: 'error', autoClose: 6000 });
    } finally {
      setUploading(false);
    }
  };

  const handleEditMember = (m: IFamilyMember) => {
    const isKnownRel = REL_OPTIONS.includes(m.relationship);
    openEditFamily({
      memberId: m.memberId,
      first: m.firstName,
      last: m.lastName,
      rel: isKnownRel ? m.relationship : 'Other',
      relOther: isKnownRel ? '' : m.relationship || '',
      dob: m.dateOfBirth ? m.dateOfBirth.slice(0, 10) : '',
      sex: m.gender || '',
      email: m.email || '',
      phone: (m.phone || '').replace(/\D/g, ''),
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await dispatch(deleteFamilyMember({ memberIds: [deleteTarget.memberId] })).unwrap();
      showAlert({ message: 'Family member removed successfully', status: 'success', autoClose: 6000 });
      dispatch(getUserProfile());
    } catch (error: any) {
      const message = error?.headers?.message || error?.message || 'Something went wrong';
      showAlert({ message, status: 'error', autoClose: 6000 });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
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
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div
          className="pcard-av"
          onClick={() => !uploading && fileInputRef.current?.click()}
          title="Upload photo"
          style={{
            position: 'relative',
            cursor: uploading ? 'default' : 'pointer',
            overflow: 'hidden',
            backgroundImage: userProfile?.profilePicUrl ? `url(${userProfile.profilePicUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!userProfile?.profilePicUrl && initials(userProfile?.firstName, userProfile?.lastName)}
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              background: 'rgba(0,0,0,.28)',
              opacity: 0,
              transition: 'opacity .15s',
              paddingBottom: 6,
            }}
            className="pcard-av-overlay"
          >
            <Icon name="image" />
          </span>
        </div>
        <div>
          <div className="pcard-nm">{fullName}</div>
          <div className="pcard-sub">
            {formatUSPhone(userProfile?.phoneNo ?? '')}
            {userProfile?.email ? ` · ${userProfile.email}` : ''}
          </div>
          {uploading && (
            <div className="pcard-sub" style={{ marginTop: 4 }}>
              Uploading photo…
            </div>
          )}
        </div>
      </div>

      <div className="psec">
        <div className="psec-h">
          <h4>My details</h4>
          <a className="psec-act" style={{ cursor: 'pointer' }} onClick={() => setEditOpen(true)}>
            <Icon name="edit" />
            Edit
          </a>
        </div>
        <div className="pcard">
          <div className="kv-grid" style={{ borderTop: 'none' }}>
            <div className="dl2">
              <span className="plist-k">Full name</span>
              <span className="plist-v">{fullName}</span>
            </div>
            <div className="dl2">
              <span className="plist-k">Date of birth</span>
              <span className="plist-v">
                {userProfile?.dateOfBirth ? fmtLong(userProfile.dateOfBirth.slice(0, 10)) : '—'}
              </span>
            </div>
            <div className="dl2">
              <span className="plist-k">Mobile</span>
              <span className="plist-v">{formatUSPhone(userProfile?.phoneNo ?? '')}</span>
            </div>
            <div className="dl2">
              <span className="plist-k">Email</span>
              <span className="plist-v">{userProfile?.email ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="psec">
        <div className="psec-h">
          <h4>Family members</h4>
          <a className="psec-act" style={{ cursor: 'pointer' }} onClick={() => openAddFamily('profile')}>
            <Icon name="plus" sw={2.4} />
            Add
          </a>
        </div>
        <div className="pcard">
          <div className="pfam-grid">
            {family.length === 0 ? (
              <div className="pfam-nm" style={{ opacity: 0.6 }}>
                No family members added yet.
              </div>
            ) : (
              family.map((m) => (
                <div key={m.memberId} className="pfam-row">
                  <div className="pfam-av">{initials(m.firstName, m.lastName)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="pfam-nm">
                      {m.firstName} {m.lastName}
                    </div>
                    <div className="pfam-detail">
                      {m.relationship && <span>{m.relationship}</span>}
                      {m.gender && <span>{m.gender}</span>}
                      {m.dateOfBirth && <span>DOB {fmtLong(m.dateOfBirth.slice(0, 10))}</span>}
                      {m.email && <span>{m.email}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <a
                      className="psec-act"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleEditMember(m)}
                      title="Edit"
                    >
                      <Icon name="edit" />
                    </a>
                    <a
                      className="psec-act"
                      style={{ cursor: 'pointer', color: 'var(--rose)' }}
                      onClick={() => setDeleteTarget({ memberId: m.memberId, name: `${m.firstName} ${m.lastName}` })}
                      title="Remove"
                    >
                      <Icon name="x" />
                    </a>
                  </div>
                </div>
              ))
            )}
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
      <button className="btn btn-ghost btn-block" onClick={signOut} style={{ maxWidth: 340 }}>
        Sign out
      </button>

      <EditProfileModal
        open={editOpen}
        userProfile={userProfile}
        onClose={() => setEditOpen(false)}
        onChangeContact={(type) => setContact({ open: true, type })}
      />
      <ContactChangeModal
        open={contact.open}
        type={contact.type}
        onClose={() => setContact((c) => ({ ...c, open: false }))}
      />

      {deleteTarget && (
        <div className="getsheet-scrim" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="getsheet-card notice-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="serif">Remove family member</h3>
            <p style={{ marginBottom: 0 }}>
              Are you sure you want to remove <strong>{deleteTarget.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="af-btns">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Keep it
              </button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
