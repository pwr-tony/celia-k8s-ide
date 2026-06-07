export type KeyboardModifier = 'meta' | 'ctrl' | 'shift' | 'alt'

export type CommandContext = 'global' | 'table' | 'detail' | 'editor'

export interface KeyBinding {
  key: string
  modifiers?: KeyboardModifier[]
}

export interface ChordBinding {
  keys: string[]
}

export interface Command {
  id: string
  label: string
  description?: string
  icon?: string
  keybinding?: KeyBinding
  chord?: ChordBinding
  contexts: CommandContext[]
  hidden?: boolean
  execute: () => void
}

export interface KeyboardState {
  activeContext: CommandContext
  pendingChord: string[]
  chordTimeout: number | null
}
