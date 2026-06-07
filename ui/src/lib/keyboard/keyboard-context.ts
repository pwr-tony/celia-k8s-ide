import { createContext } from 'react'
import type { CommandContext } from './types'
import type { Command } from './types'

export interface KeyboardContextValue {
  activeContext: CommandContext
  setActiveContext: (context: CommandContext) => void
  pendingChord: string[]
  registerCommand: (command: Command) => () => void
  setEnabled: (enabled: boolean) => void
}

export const KeyboardContext = createContext<KeyboardContextValue | null>(null)
