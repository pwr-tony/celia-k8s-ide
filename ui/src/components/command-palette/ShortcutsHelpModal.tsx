import { useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Kbd,
} from '@/components/primitives'
import { useRegisterCommand } from '@/lib/keyboard'
import { useShortcutsHelpStore } from '@/stores'

interface ShortcutGroup {
  title: string
  shortcuts: Array<{
    keys: React.ReactNode
    description: string
  }>
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Global',
    shortcuts: [
      { keys: <><Kbd>{'\u2318'}</Kbd><Kbd>K</Kbd></>, description: 'Open Command Palette' },
      { keys: <Kbd>?</Kbd>, description: 'Show Keyboard Shortcuts' },
      { keys: <Kbd>Esc</Kbd>, description: 'Close Modal / Cancel' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: <><Kbd>G</Kbd><Kbd>P</Kbd></>, description: 'Go to Pods' },
      { keys: <><Kbd>G</Kbd><Kbd>D</Kbd></>, description: 'Go to Deployments' },
      { keys: <><Kbd>G</Kbd><Kbd>S</Kbd></>, description: 'Go to Services' },
      { keys: <><Kbd>G</Kbd><Kbd>C</Kbd></>, description: 'Go to ConfigMaps' },
      { keys: <><Kbd>G</Kbd><Kbd>X</Kbd></>, description: 'Go to Secrets' },
      { keys: <><Kbd>G</Kbd><Kbd>N</Kbd></>, description: 'Go to Nodes' },
      { keys: <><Kbd>G</Kbd><Kbd>A</Kbd></>, description: 'Go to Audit Log' },
      { keys: <><Kbd>G</Kbd><Kbd>H</Kbd></>, description: 'Go to Dashboard' },
      { keys: <Kbd>Backspace</Kbd>, description: 'Go Back' },
    ],
  },
  {
    title: 'Table Navigation',
    shortcuts: [
      { keys: <Kbd>J</Kbd>, description: 'Move Down' },
      { keys: <Kbd>K</Kbd>, description: 'Move Up' },
      { keys: <Kbd>Enter</Kbd>, description: 'Open Selected' },
      { keys: <><Kbd>G</Kbd><Kbd>G</Kbd></>, description: 'Go to First' },
      { keys: <Kbd>G</Kbd>, description: 'Go to Last (Shift+G)' },
      { keys: <Kbd>/</Kbd>, description: 'Focus Search' },
    ],
  },
  {
    title: 'YAML Editor',
    shortcuts: [
      { keys: <Kbd>Y</Kbd>, description: 'Copy YAML' },
      { keys: <Kbd>E</Kbd>, description: 'Edit YAML' },
      { keys: <><Kbd>{'\u2318'}</Kbd><Kbd>S</Kbd></>, description: 'Save Changes' },
    ],
  },
  {
    title: 'Resource Actions',
    shortcuts: [
      { keys: <Kbd>S</Kbd>, description: 'Scale (Deployments)' },
      { keys: <Kbd>R</Kbd>, description: 'Restart (Deployments)' },
      { keys: <Kbd>X</Kbd>, description: 'Delete (Pods)' },
    ],
  },
]

export function ShortcutsHelpModal() {
  const { isOpen, open, close } = useShortcutsHelpStore()

  const toggleHelp = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }, [isOpen, open, close])

  useRegisterCommand({
    id: 'help.shortcuts',
    label: 'Show Keyboard Shortcuts',
    keybinding: { key: '?', modifiers: [] },
    contexts: ['global'],
    hidden: true,
    execute: toggleHelp,
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : close())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-2 gap-6">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-text-secondary">{shortcut.description}</span>
                    <span className="flex items-center gap-1">{shortcut.keys}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
