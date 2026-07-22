import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  fetchCenters,
  fetchPeople,
  fetchProviders,
  fetchRequests,
  fetchSelfUploads,
  fetchShares,
  fetchStudies,
} from '@/api/endpoints';

export function usePeople() {
  return useQuery({ queryKey: queryKeys.people, queryFn: fetchPeople });
}

export function useProviders() {
  return useQuery({ queryKey: queryKeys.providers, queryFn: fetchProviders });
}

export function useCenters() {
  return useQuery({ queryKey: queryKeys.centers, queryFn: fetchCenters });
}

export function useStudies() {
  return useQuery({ queryKey: queryKeys.studies, queryFn: fetchStudies });
}

export function useSelfUploads() {
  return useQuery({ queryKey: queryKeys.selfUploads, queryFn: fetchSelfUploads });
}

export function useRequests() {
  return useQuery({ queryKey: queryKeys.requests, queryFn: fetchRequests });
}

export function useShares() {
  return useQuery({ queryKey: queryKeys.shares, queryFn: fetchShares });
}
