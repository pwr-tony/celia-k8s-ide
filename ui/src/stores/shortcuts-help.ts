import { create } from 'zustand'

interface ShortcutsHelpState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useShortcutsHelpStore = create<ShortcutsHelpState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
