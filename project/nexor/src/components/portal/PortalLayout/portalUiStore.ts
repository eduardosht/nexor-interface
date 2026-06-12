import { create } from 'zustand';
import { readStorageValue, writeStorageValue } from '../../../lib/browser-storage';

const SIDEBAR_STORAGE_KEY = 'nexor-sidebar-collapsed';

function readSidebarCollapsed() {
  return readStorageValue(SIDEBAR_STORAGE_KEY) === 'true';
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
    writeStorageValue(SIDEBAR_STORAGE_KEY, String(collapsed));
    set({ sidebarCollapsed: collapsed });
  },
  toggleSidebarCollapsed: () => {
    const next = !get().sidebarCollapsed;
    writeStorageValue(SIDEBAR_STORAGE_KEY, String(next));
    set({ sidebarCollapsed: next });
  },
}));
