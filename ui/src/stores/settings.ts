import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SeverityThresholds {
  notificationMinSeverity: 1 | 2 | 3 | 4
  highlightMinSeverity: 1 | 2 | 3 | 4
  soundEnabled: boolean
}

interface SettingsState extends SeverityThresholds {
  setSeverityThreshold: (key: keyof SeverityThresholds, value: number | boolean) => void
  resetDefaults: () => void
}

const defaults: SeverityThresholds = {
  notificationMinSeverity: 2,
  highlightMinSeverity: 3,
  soundEnabled: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,

      setSeverityThreshold: (key, value) => {
        set({ [key]: value })
      },

      resetDefaults: () => {
        set(defaults)
      },
    }),
    {
      name: 'celia-settings',
    }
  )
)
