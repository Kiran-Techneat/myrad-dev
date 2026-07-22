import { apiClient } from './client';
import type {
  Center,
  ImagingRequest,
  Person,
  Provider,
  RequestItem,
  Share,
  Study,
} from '@/types';

async function get<T>(url: string): Promise<T> {
  const { data } = await apiClient.get<T>(url);
  return data;
}

// ---- Reads -----------------------------------------------------------------
export const fetchPeople = () => get<Person[]>('/people');
export const fetchProviders = () => get<Provider[]>('/providers');
export const fetchCenters = () => get<Center[]>('/centers');
export const fetchStudies = () => get<Study[]>('/studies');
export const fetchSelfUploads = () => get<Study[]>('/self-uploads');
export const fetchRequests = () => get<ImagingRequest[]>('/requests');
export const fetchShares = () => get<Share[]>('/shares');

// ---- Writes ----------------------------------------------------------------
export async function createPerson(person: Person): Promise<Person[]> {
  const { data } = await apiClient.post<Person[]>('/people', person);
  return data;
}

export async function createProvider(provider: Provider): Promise<Provider[]> {
  const { data } = await apiClient.post<Provider[]>('/providers', provider);
  return data;
}

export async function createCenter(center: Center): Promise<Center[]> {
  const { data } = await apiClient.post<Center[]>('/centers', center);
  return data;
}

export async function createSelfUpload(study: Study): Promise<Study[]> {
  const { data } = await apiClient.post<Study[]>('/self-uploads', study);
  return data;
}

export async function patchSelfUpload(
  id: Study['id'],
  patch: Partial<Study>,
): Promise<Study[]> {
  const { data } = await apiClient.patch<Study[]>(`/self-uploads/${id}`, patch);
  return data;
}

export async function createRequest(req: ImagingRequest): Promise<ImagingRequest[]> {
  const { data } = await apiClient.post<ImagingRequest[]>('/requests', req);
  return data;
}

export async function updateRequestItems(
  id: string,
  items: RequestItem[],
): Promise<ImagingRequest[]> {
  const { data } = await apiClient.post<ImagingRequest[]>(`/requests/${id}/items`, { items });
  return data;
}

export async function createShares(shares: Share[]): Promise<Share[]> {
  const { data } = await apiClient.post<Share[]>('/shares', { shares });
  return data;
}

export async function deleteShare(index: number): Promise<Share[]> {
  const { data } = await apiClient.delete<Share[]>(`/shares/${index}`);
  return data;
}
