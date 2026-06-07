import { useEffect, useState } from 'react'
import { Kbd } from '@/components/primitives'
import { keyboardManager } from '@/lib/keyboard'

export function ShortcutHintsBar() {
  const [pendingChord, setPendingChord] = useState<string[]>([])

  useEffect(() => {
    return keyboardManager.onChordChange(setPendingChord)
  }, [])

  return (
    <div className="h-6 px-4 flex items-center justify-between bg-bg-tertiary border-t border-border-subtle text-xs text-text-tertiary">
      <div className="flex items-center gap-4">
        {pendingChord.length > 0 ? (
          <span className="flex items-center gap-1 text-accent-primary">
            {pendingChord.map((key, i) => (
              <Kbd key={i}>{key.toUpperCase()}</Kbd>
            ))}
            <span className="animate-pulse">...</span>
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <Kbd>{'\u2318'}</Kbd><Kbd>K</Kbd>
              <span className="ml-1">Command Palette</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd>G</Kbd>
              <span className="ml-1">Navigation</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd>?</Kbd>
              <span className="ml-1">Help</span>
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-text-tertiary/60">vim-style navigation</span>
      </div>
    </div>
  )
}
