import type { CommandContext, KeyboardModifier } from './types'
import { commandRegistry } from './command-registry'

const CHORD_TIMEOUT_MS = 500

type ChordCallback = (chord: string[]) => void

class KeyboardManager {
  private context: CommandContext = 'global'
  private pendingChord: string[] = []
  private chordTimeoutId: number | null = null
  private chordListeners: Set<ChordCallback> = new Set()
  private enabled = true

  setContext(context: CommandContext): void {
    this.context = context
  }

  getContext(): CommandContext {
    return this.context
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }

  getPendingChord(): string[] {
    return [...this.pendingChord]
  }

  onChordChange(callback: ChordCallback): () => void {
    this.chordListeners.add(callback)
    return () => this.chordListeners.delete(callback)
  }

  private notifyChordChange(): void {
    const chord = [...this.pendingChord]
    this.chordListeners.forEach((cb) => cb(chord))
  }

  private clearChord(): void {
    this.pendingChord = []
    if (this.chordTimeoutId !== null) {
      window.clearTimeout(this.chordTimeoutId)
      this.chordTimeoutId = null
    }
    this.notifyChordChange()
  }

  private startChordTimeout(): void {
    if (this.chordTimeoutId !== null) {
      window.clearTimeout(this.chordTimeoutId)
    }
    this.chordTimeoutId = window.setTimeout(() => {
      this.clearChord()
    }, CHORD_TIMEOUT_MS)
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.enabled) return false

    const target = event.target as HTMLElement
    const isInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable

    const modifiers = new Set<KeyboardModifier>()
    if (event.metaKey) modifiers.add('meta')
    if (event.ctrlKey) modifiers.add('ctrl')
    if (event.shiftKey) modifiers.add('shift')
    if (event.altKey) modifiers.add('alt')

    const key = event.key

    if (modifiers.has('meta') || modifiers.has('ctrl')) {
      const command = commandRegistry.findByKeybinding(key, modifiers as Set<string>)
      if (command) {
        const inContext =
          command.contexts.includes('global') || command.contexts.includes(this.context)
        if (inContext) {
          event.preventDefault()
          this.clearChord()
          command.execute()
          return true
        }
      }
    }

    if (key === 'Escape') {
      const escapeCommand = commandRegistry.findByKeybinding('Escape', new Set())
      if (escapeCommand) {
        const inContext =
          escapeCommand.contexts.includes('global') || escapeCommand.contexts.includes(this.context)
        if (inContext) {
          event.preventDefault()
          this.clearChord()
          escapeCommand.execute()
          return true
        }
      }
      this.clearChord()
      return false
    }

    if (isInput && !modifiers.has('meta') && !modifiers.has('ctrl')) {
      this.clearChord()
      return false
    }

    if (modifiers.size === 0 || (modifiers.size === 1 && modifiers.has('shift'))) {
      const newChord = [...this.pendingChord, key]

      const exactMatch = commandRegistry.findByChord(newChord)
      if (exactMatch) {
        const inContext =
          exactMatch.contexts.includes('global') || exactMatch.contexts.includes(this.context)
        if (inContext) {
          event.preventDefault()
          this.clearChord()
          exactMatch.execute()
          return true
        }
      }

      const partialMatches = commandRegistry.findPartialChord(newChord)
      if (partialMatches.length > 0) {
        event.preventDefault()
        this.pendingChord = newChord
        this.notifyChordChange()
        this.startChordTimeout()
        return true
      }

      if (this.pendingChord.length === 0) {
        const singleKeyCommand = commandRegistry.getByContext(this.context).find(
          (cmd) =>
            cmd.keybinding?.key.toLowerCase() === key.toLowerCase() &&
            (cmd.keybinding.modifiers ?? []).length === 0
        )
        if (singleKeyCommand) {
          event.preventDefault()
          singleKeyCommand.execute()
          return true
        }
      }

      this.clearChord()
    }

    return false
  }

  attach(): () => void {
    const handler = (e: KeyboardEvent) => this.handleKeyDown(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }
}

export const keyboardManager = new KeyboardManager()
