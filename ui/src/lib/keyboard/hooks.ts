import { useContext, useEffect } from 'react'
import type { Command } from './types'
import { KeyboardContext } from './keyboard-context'

export function useKeyboardContext() {
  const context = useContext(KeyboardContext)
  if (!context) {
    throw new Error('useKeyboardContext must be used within KeyboardProvider')
  }
  return context
}

export function useRegisterCommand(command: Command): void {
  const { registerCommand } = useKeyboardContext()

  useEffect(() => {
    return registerCommand(command)
  }, [command, registerCommand])
}

export function useKeyboardEnabled(enabled: boolean): void {
  const { setEnabled } = useKeyboardContext()

  useEffect(() => {
    setEnabled(enabled)
    return () => setEnabled(true)
  }, [enabled, setEnabled])
}
