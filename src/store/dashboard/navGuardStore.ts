import { create } from 'zustand';

/**
 * Central "unsaved changes" navigation guard. A screen (e.g. the create-request
 * Wizard) registers a `guard` predicate; while it returns true, any imperative
 * navigation routed through `useAppNavigate` is intercepted — the intended
 * navigation is stashed as `pendingNav` and a confirm modal (rendered in AppShell)
 * decides whether to proceed. Kept out of the URL/router so it works with the
 * app's plain `<BrowserRouter>` (no data-router `useBlocker`).
 */
interface NavGuardState {
  /** Returns true when navigating away should be confirmed first. */
  guard: (() => boolean) | null;
  /** The navigation deferred while the confirm modal is open. */
  pendingNav: (() => void) | null;

  setGuard: (guard: (() => boolean) | null) => void;
  clearGuard: () => void;

  /**
   * Run `fn` immediately, or — when the active guard says so — defer it and open
   * the confirm modal. Returns true if the navigation was deferred.
   */
  requestNav: (fn: () => void) => boolean;
  confirmPending: () => void;
  cancelPending: () => void;
}

export const useNavGuardStore = create<NavGuardState>((set, get) => ({
  guard: null,
  pendingNav: null,

  setGuard: (guard) => set({ guard }),
  clearGuard: () => set({ guard: null, pendingNav: null }),

  requestNav: (fn) => {
    const { guard } = get();
    if (guard && guard()) {
      set({ pendingNav: fn });
      return true;
    }
    fn();
    return false;
  },

  confirmPending: () => {
    const { pendingNav } = get();
    set({ pendingNav: null });
    pendingNav?.();
  },

  cancelPending: () => set({ pendingNav: null }),
}));
