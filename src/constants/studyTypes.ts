import type { PartGroup, StudyType } from '@/types';

export const STUDY_TYPES: StudyType[] = [
  { id: 'mri', abbr: 'MRI', label: 'MRI', groupKey: 'MRI' },
  { id: 'ct', abbr: 'CT', label: 'CT', groupKey: 'MRI' },
  { id: 'xr', abbr: 'XR', label: 'X-Ray', groupKey: 'X-Ray' },
  { id: 'us', abbr: 'US', label: 'Ultrasound', groupKey: 'Ultrasound' },
  { id: 'echo', abbr: 'ECHO', label: 'Echocardiography', groupKey: null },
  { id: 'pet', abbr: 'PET', label: 'PET', groupKey: 'PET' },
  { id: 'mmg', abbr: 'MMG', label: 'Mammogram', groupKey: null },
  { id: 'ns', abbr: 'NS', label: "I'm not sure", groupKey: 'default' },
  { id: 'oth', abbr: 'OTH', label: 'Other', groupKey: 'default', filterFree: true },
];

export const PART_GROUPS: Record<string, PartGroup[]> = {
  MRI: [
    { k: 'head', l: 'Head/Brain' },
    { k: 'hn', l: 'Head & Neck' },
    { k: 'spine', l: 'Spine', short: 'Spine', ch: ['Cervical', 'Thoracic', 'Lumbar', 'Whole spine'] },
    { k: 'chest', l: 'Chest' },
    { k: 'abd', l: 'Abdomen/Pelvis' },
    { k: 'arm', l: 'Arm/Upper extremity', short: 'Arm', ch: ['Shoulder', 'Elbow', 'Arm', 'Wrist', 'Hand'] },
    { k: 'leg', l: 'Leg/Lower extremity', short: 'Leg', ch: ['Pelvis', 'Hip', 'Knee', 'Ankle', 'Foot'] },
  ],
  'X-Ray': [
    { k: 'head', l: 'Head', short: 'Head', ch: ['Skull', 'Orbits', 'Facial bones', 'Sinuses', 'Other'] },
    { k: 'spine', l: 'Spine', short: 'Spine', ch: ['Cervical', 'Thoracic', 'Lumbar', 'Whole spine'] },
    { k: 'chest', l: 'Chest' },
    { k: 'abd', l: 'Abdomen' },
    { k: 'arm', l: 'Arm/Upper extremity', short: 'Arm', ch: ['Shoulder', 'Elbow', 'Arm', 'Wrist', 'Hand', 'Other'] },
    { k: 'leg', l: 'Leg/Lower extremity', short: 'Leg', ch: ['Pelvis', 'Hip', 'Knee', 'Ankle', 'Foot', 'Other'] },
    { k: 'other', l: 'Other', free: true },
  ],
  Ultrasound: [
    { k: 'thy', l: 'Thyroid' }, { k: 'neck', l: 'Neck' }, { k: 'abd', l: 'Abdomen' }, { k: 'pel', l: 'Pelvis' },
    { k: 'renal', l: 'Renal' }, { k: 'soft', l: 'Soft tissue' }, { k: 'breast', l: 'Breast' }, { k: 'vasc', l: 'Vascular' },
    { k: 'other', l: 'Other', free: true }, { k: 'ns', l: "I'm not sure" },
  ],
  PET: [
    { k: 'wb', l: 'Whole body' }, { k: 'brain', l: 'Brain' }, { k: 'lung', l: 'Lung' }, { k: 'psma', l: 'PSMA (prostate)' },
    { k: 'other', l: 'Other', free: true }, { k: 'idk', l: "I don't know" },
  ],
  default: [
    { k: 'head', l: 'Head/Brain' }, { k: 'hn', l: 'Head & Neck' }, { k: 'spine', l: 'Spine' }, { k: 'chest', l: 'Chest' },
    { k: 'abd', l: 'Abdomen/Pelvis' }, { k: 'arm', l: 'Arm/Upper extremity' }, { k: 'leg', l: 'Leg/Lower extremity' },
    { k: 'other', l: 'Other', free: true },
  ],
};

export interface WizStep {
  key: 'person' | 'center' | 'studies' | 'review';
  n: number;
  label: string;
}

export const WIZ_STEPS: WizStep[] = [
  { key: 'person', n: 1, label: 'Patient' },
  { key: 'center', n: 2, label: 'Center' },
  { key: 'studies', n: 3, label: 'Studies' },
  { key: 'review', n: 4, label: 'Review' },
];
