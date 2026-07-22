import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getDb, mutateDb } from './db';
import type {
  Center,
  ImagingRequest,
  Person,
  Provider,
  Share,
  Study,
} from '@/types';
import { computeReqStatus } from '@/utils/status';

/**
 * A tiny in-memory REST server implemented as an axios adapter. Every request
 * the app makes is routed here, so the data flow is a genuine
 * component -> query hook -> axios -> adapter -> localStorage DB pipeline
 * without needing a network backend.
 */

type Handler = (ctx: { params: Record<string, string>; body: unknown }) => unknown;

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

const routes: Route[] = [];

function add(method: string, path: string, handler: Handler): void {
  const keys: string[] = [];
  const pattern = new RegExp(
    '^' +
      path.replace(/:[^/]+/g, (m) => {
        keys.push(m.slice(1));
        return '([^/]+)';
      }) +
      '$',
  );
  routes.push({ method: method.toUpperCase(), pattern, keys, handler });
}

// ---- Collections -----------------------------------------------------------
add('GET', '/people', () => getDb().people);
add('GET', '/providers', () => getDb().providers);
add('GET', '/centers', () => getDb().centers);
add('GET', '/studies', () => getDb().studies);
add('GET', '/self-uploads', () => getDb().selfUploads);
add('GET', '/requests', () => getDb().requests);
add('GET', '/shares', () => getDb().shares);

// ---- People ----------------------------------------------------------------
add('POST', '/people', ({ body }) => {
  const person = body as Person;
  return mutateDb((d) => {
    d.people.push(person);
  }).people;
});

// ---- Providers -------------------------------------------------------------
add('POST', '/providers', ({ body }) => {
  const provider = body as Provider;
  return mutateDb((d) => {
    d.providers.push(provider);
  }).providers;
});

// ---- Centers ---------------------------------------------------------------
add('POST', '/centers', ({ body }) => {
  const center = body as Center;
  return mutateDb((d) => {
    d.centers.push(center);
  }).centers;
});

// ---- Self uploads ----------------------------------------------------------
add('POST', '/self-uploads', ({ body }) => {
  const study = body as Study;
  return mutateDb((d) => {
    d.selfUploads.unshift(study);
  }).selfUploads;
});
add('PATCH', '/self-uploads/:id', ({ params, body }) => {
  const patch = body as Partial<Study>;
  return mutateDb((d) => {
    d.selfUploads = d.selfUploads.map((s) =>
      String(s.id) === params.id ? { ...s, ...patch } : s,
    );
  }).selfUploads;
});

// ---- Requests --------------------------------------------------------------
add('POST', '/requests', ({ body }) => {
  const req = body as ImagingRequest;
  return mutateDb((d) => {
    d.requests.unshift(req);
  }).requests;
});
add('PUT', '/requests/:id', ({ params, body }) => {
  const next = body as ImagingRequest;
  return mutateDb((d) => {
    d.requests = d.requests.map((r) => (r.id === params.id ? next : r));
  }).requests;
});
// Recompute + persist an item mutation on a request.
add('POST', '/requests/:id/items', ({ params, body }) => {
  const { items } = body as { items: ImagingRequest['items'] };
  return mutateDb((d) => {
    d.requests = d.requests.map((r) =>
      r.id === params.id ? { ...r, items, status: computeReqStatus(items) } : r,
    );
  }).requests;
});

// ---- Shares ----------------------------------------------------------------
add('POST', '/shares', ({ body }) => {
  const { shares } = body as { shares: Share[] };
  return mutateDb((d) => {
    d.shares = [...shares, ...d.shares];
  }).shares;
});
add('DELETE', '/shares/:index', ({ params }) => {
  const idx = Number(params.index);
  return mutateDb((d) => {
    d.shares = d.shares.filter((_, i) => i !== idx);
  }).shares;
});

const LATENCY_MS = 180;

export const mockAdapter: AxiosAdapter = (config: InternalAxiosRequestConfig) =>
  new Promise<AxiosResponse>((resolve, reject) => {
    const method = (config.method || 'get').toUpperCase();
    const url = (config.url || '').split('?')[0];
    const route = routes.find((r) => r.method === method && r.pattern.test(url));

    setTimeout(() => {
      if (!route) {
        reject(new Error(`Mock 404: ${method} ${url}`));
        return;
      }
      const match = route.pattern.exec(url)!;
      const params: Record<string, string> = {};
      route.keys.forEach((k, i) => (params[k] = decodeURIComponent(match[i + 1])));
      let body: unknown = undefined;
      if (config.data) {
        try {
          body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        } catch {
          body = config.data;
        }
      }
      try {
        const data = route.handler({ params, body });
        resolve({
          data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {},
        } as unknown as AxiosResponse);
      } catch (err) {
        reject(err);
      }
    }, LATENCY_MS);
  });
