import { create } from 'zustand';

const SIDEBAR_STORAGE_KEY = 'nexor-sidebar-collapsed';

function readSidebarCollapsed() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

interface PortalUiState {
  sidebarCollapsed: boolean;
  hydrateSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
}

export const usePortalUiStore = create<PortalUiState>((set, get) => ({
  sidebarCollapsed: readSidebarCollapsed(),
  hydrateSidebarCollapsed: () => {
    set({ sidebarCollapsed: readSidebarCollapsed() });
  },
  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    }
    set({ sidebarCollapsed: collapsed });
  },
  toggleSidebarCollapsed: () => {
    const next = !get().sidebarCollapsed;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
    }
    set({ sidebarCollapsed: next });
  },
}));
