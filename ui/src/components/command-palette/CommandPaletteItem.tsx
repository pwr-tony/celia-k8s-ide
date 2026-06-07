import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Kbd } from '@/components/primitives'
import type { Command, KeyBinding, ChordBinding } from '@/lib/keyboard'

interface CommandPaletteItemProps {
  command: Command
  isSelected: boolean
  matchIndices: number[]
  onClick: () => void
}

function formatKeybinding(keybinding: KeyBinding): React.ReactNode {
  const parts: string[] = []

  if (keybinding.modifiers?.includes('meta')) parts.push('\u2318')
  if (keybinding.modifiers?.includes('ctrl')) parts.push('Ctrl')
  if (keybinding.modifiers?.includes('shift')) parts.push('\u21E7')
  if (keybinding.modifiers?.includes('alt')) parts.push('\u2325')

  const key = keybinding.key === ' ' ? 'Space' : keybinding.key.toUpperCase()
  parts.push(key)

  return (
    <span className="flex items-center gap-0.5">
      {parts.map((part, i) => (
        <Kbd key={i}>{part}</Kbd>
      ))}
    </span>
  )
}

function formatChord(chord: ChordBinding): React.ReactNode {
  return (
    <span className="flex items-center gap-1">
      {chord.keys.map((key, i) => (
        <Kbd key={i}>{key.toUpperCase()}</Kbd>
      ))}
    </span>
  )
}

function HighlightedText({ text, indices }: { text: string; indices: number[] }) {
  if (indices.length === 0) {
    return <span>{text}</span>
  }

  const indexSet = new Set(indices)
  const chars = text.split('')

  return (
    <span>
      {chars.map((char, i) =>
        indexSet.has(i) ? (
          <span key={i} className="text-accent-primary font-semibold">
            {char}
          </span>
        ) : (
          <span key={i}>{char}</span>
        )
      )}
    </span>
  )
}

export const CommandPaletteItem = forwardRef<HTMLButtonElement, CommandPaletteItemProps>(
  ({ command, isSelected, matchIndices, onClick }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-left',
          'rounded-md transition-colors',
          isSelected ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:bg-bg-hover'
        )}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">
            <HighlightedText text={command.label} indices={matchIndices} />
          </span>
          {command.description && (
            <span className="text-xs text-text-tertiary">{command.description}</span>
          )}
        </div>
        {command.keybinding && formatKeybinding(command.keybinding)}
        {command.chord && formatChord(command.chord)}
      </button>
    )
  }
)

CommandPaletteItem.displayName = 'CommandPaletteItem'
