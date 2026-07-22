import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createCenter,
  createPerson,
  createProvider,
  createRequest,
  createSelfUpload,
  createShares,
  deleteShare,
  patchSelfUpload,
  updateRequestItems,
} from '@/api/endpoints';
import type { Center, ImagingRequest, Person, Provider, RequestItem, Share, Study } from '@/types';

export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (person: Person) => createPerson(person),
    onSuccess: (people) => qc.setQueryData(queryKeys.people, people),
  });
}

export function useCreateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: Provider) => createProvider(provider),
    onSuccess: (providers) => qc.setQueryData(queryKeys.providers, providers),
  });
}

export function useCreateCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (center: Center) => createCenter(center),
    onSuccess: (centers) => qc.setQueryData(queryKeys.centers, centers),
  });
}

export function useCreateSelfUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (study: Study) => createSelfUpload(study),
    onSuccess: (list) => qc.setQueryData(queryKeys.selfUploads, list),
  });
}

export function usePatchSelfUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: Study['id']; patch: Partial<Study> }) =>
      patchSelfUpload(id, patch),
    onSuccess: (list) => qc.setQueryData(queryKeys.selfUploads, list),
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: ImagingRequest) => createRequest(req),
    onSuccess: (list) => qc.setQueryData(queryKeys.requests, list),
  });
}

export function useUpdateRequestItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: RequestItem[] }) =>
      updateRequestItems(id, items),
    onSuccess: (list) => qc.setQueryData(queryKeys.requests, list),
  });
}

export function useCreateShares() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shares: Share[]) => createShares(shares),
    onSuccess: (list) => qc.setQueryData(queryKeys.shares, list),
  });
}

export function useDeleteShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (index: number) => deleteShare(index),
    onSuccess: (list) => qc.setQueryData(queryKeys.shares, list),
  });
}
