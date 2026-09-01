import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Problem } from '@/api/schemas'

export interface ResolvedProblem {
  problem: Problem
  resolvedAt: number
}

interface ProblemHistoryState {
  resolvedProblems: ResolvedProblem[]
  trackResolved: (problems: Problem[]) => void
  clearHistory: () => void
}

export const useProblemHistoryStore = create<ProblemHistoryState>()(
  persist(
    (set, get) => ({
      resolvedProblems: [],

      trackResolved: (currentProblems: Problem[]) => {
        const currentIds = new Set(currentProblems.map((p) => p.id))
        const state = get()

        const existingIds = new Set(state.resolvedProblems.map((r) => r.problem.id))

        const previousProblems = JSON.parse(
          sessionStorage.getItem('celia-previous-problems') || '[]'
        ) as Problem[]

        const newlyResolved: ResolvedProblem[] = []
        previousProblems.forEach((prev) => {
          if (!currentIds.has(prev.id) && !existingIds.has(prev.id)) {
            newlyResolved.push({
              problem: prev,
              resolvedAt: Date.now(),
            })
          }
        })

        sessionStorage.setItem('celia-previous-problems', JSON.stringify(currentProblems))

        if (newlyResolved.length > 0) {
          set({
            resolvedProblems: [...newlyResolved, ...state.resolvedProblems].slice(0, 100),
          })
        }
      },

      clearHistory: () => {
        set({ resolvedProblems: [] })
      },
    }),
    {
      name: 'celia-problem-history',
    }
  )
)
