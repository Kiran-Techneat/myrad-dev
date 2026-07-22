import axios from 'axios';
import { mockAdapter } from './mockAdapter';

/**
 * Central axios instance. In this demo it points at an in-memory mock adapter;
 * swap `adapter` for a real `baseURL` to talk to a live backend without
 * touching any of the endpoint or hook code.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  adapter: mockAdapter,
});
