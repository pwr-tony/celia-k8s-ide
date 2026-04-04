import { create } from 'zustand'

interface SelectedResource {
  kind: string
  namespace: string
  name: string
}

interface SelectionState {
  selected: SelectedResource | null
  hoveredPod: string | null

  select: (resource: SelectedResource | null) => void
  selectPod: (namespace: string, name: string) => void
  selectDeployment: (namespace: string, name: string) => void
  selectService: (namespace: string, name: string) => void
  selectNode: (name: string) => void
  clearSelection: () => void
  setHoveredPod: (pod: string | null) => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selected: null,
  hoveredPod: null,

  select: (selected) => set({ selected }),

  selectPod: (namespace, name) =>
    set({ selected: { kind: 'Pod', namespace, name } }),

  selectDeployment: (namespace, name) =>
    set({ selected: { kind: 'Deployment', namespace, name } }),

  selectService: (namespace, name) =>
    set({ selected: { kind: 'Service', namespace, name } }),

  selectNode: (name) =>
    set({ selected: { kind: 'Node', namespace: '', name } }),

  clearSelection: () => set({ selected: null }),

  setHoveredPod: (hoveredPod) => set({ hoveredPod }),
}))
