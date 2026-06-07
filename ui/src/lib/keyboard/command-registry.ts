import type { Command, CommandContext } from './types'

class CommandRegistry {
  private commands: Map<string, Command> = new Map()
  private listeners: Set<() => void> = new Set()

  register(command: Command): () => void {
    this.commands.set(command.id, command)
    this.notify()
    return () => this.unregister(command.id)
  }

  unregister(id: string): void {
    this.commands.delete(id)
    this.notify()
  }

  get(id: string): Command | undefined {
    return this.commands.get(id)
  }

  getAll(): Command[] {
    return Array.from(this.commands.values())
  }

  getByContext(context: CommandContext): Command[] {
    return this.getAll().filter(
      (cmd) => cmd.contexts.includes('global') || cmd.contexts.includes(context)
    )
  }

  getVisible(): Command[] {
    return this.getAll().filter((cmd) => !cmd.hidden)
  }

  findByKeybinding(key: string, modifiers: Set<string>): Command | undefined {
    return this.getAll().find((cmd) => {
      if (!cmd.keybinding) return false
      const cmdModifiers = new Set(cmd.keybinding.modifiers ?? [])
      if (cmd.keybinding.key.toLowerCase() !== key.toLowerCase()) return false
      if (cmdModifiers.size !== modifiers.size) return false
      for (const mod of cmdModifiers) {
        if (!modifiers.has(mod)) return false
      }
      return true
    })
  }

  findByChord(chord: string[]): Command | undefined {
    return this.getAll().find((cmd) => {
      if (!cmd.chord) return false
      if (cmd.chord.keys.length !== chord.length) return false
      return cmd.chord.keys.every((k, i) => k.toLowerCase() === chord[i].toLowerCase())
    })
  }

  findPartialChord(chord: string[]): Command[] {
    return this.getAll().filter((cmd) => {
      if (!cmd.chord) return false
      if (cmd.chord.keys.length <= chord.length) return false
      return chord.every((k, i) => cmd.chord!.keys[i].toLowerCase() === k.toLowerCase())
    })
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }
}

export const commandRegistry = new CommandRegistry()
