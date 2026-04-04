import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light' | 'system'

type Panel = 'problems' | 'logs' | 'events' | 'yaml' | null

interface UIState {
  theme: Theme
  sidebarCollapsed: boolean
  bottomPanelOpen: boolean
  bottomPanelHeight: number
  activeBottomPanel: Panel
  selectedNamespace: string | null

  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setBottomPanelOpen: (open: boolean) => void
  setBottomPanelHeight: (height: number) => void
  setActiveBottomPanel: (panel: Panel) => void
  setSelectedNamespace: (namespace: string | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      bottomPanelOpen: false,
      bottomPanelHeight: 300,
      activeBottomPanel: null,
      selectedNamespace: null,

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setBottomPanelOpen: (bottomPanelOpen) => set({ bottomPanelOpen }),
      setBottomPanelHeight: (bottomPanelHeight) => set({ bottomPanelHeight }),
      setActiveBottomPanel: (activeBottomPanel) =>
        set({ activeBottomPanel, bottomPanelOpen: activeBottomPanel !== null }),
      setSelectedNamespace: (selectedNamespace) => set({ selectedNamespace }),
    }),
    {
      name: 'celia-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        bottomPanelHeight: state.bottomPanelHeight,
        selectedNamespace: state.selectedNamespace,
      }),
    }
  )
)
