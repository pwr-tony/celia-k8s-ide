import { useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Command, CommandContext as CommandContextType } from './types'
import { commandRegistry } from './command-registry'
import { keyboardManager } from './keyboard-manager'
import { KeyboardContext } from './keyboard-context'

interface KeyboardProviderProps {
  children: ReactNode
}

export function KeyboardProvider({ children }: KeyboardProviderProps) {
  const [activeContext, setActiveContextState] = useState<CommandContextType>('global')
  const [pendingChord, setPendingChord] = useState<string[]>([])

  const setActiveContext = useCallback((context: CommandContextType) => {
    setActiveContextState(context)
    keyboardManager.setContext(context)
  }, [])

  const registerCommand = useCallback((command: Command) => {
    return commandRegistry.register(command)
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    keyboardManager.setEnabled(enabled)
  }, [])

  useEffect(() => {
    const detach = keyboardManager.attach()
    const unsubscribe = keyboardManager.onChordChange(setPendingChord)
    return () => {
      detach()
      unsubscribe()
    }
  }, [])

  return (
    <KeyboardContext.Provider
      value={{
        activeContext,
        setActiveContext,
        pendingChord,
        registerCommand,
        setEnabled,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  )
}
