import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import { Dialog, DialogContent, Kbd } from '@/components/primitives'
import { useCommandPaletteStore } from '@/stores/command-palette'
import { commandRegistry, useRegisterCommand, type Command } from '@/lib/keyboard'
import { fuzzyFilter } from '@/lib/fuzzy-search'
import { CommandPaletteItem } from './CommandPaletteItem'
import { ROUTES } from '@/router/routes'
import { ScrollArea } from '@/components/primitives'

export function CommandPalette() {
  const navigate = useNavigate()
  const { isOpen, query, selectedIndex, open, close, setQuery, setSelectedIndex } =
    useCommandPaletteStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const openPalette = useCallback(() => open(), [open])
  const closePalette = useCallback(() => close(), [close])

  useRegisterCommand({
    id: 'command-palette.open',
    label: 'Open Command Palette',
    keybinding: { key: 'k', modifiers: ['meta'] },
    contexts: ['global'],
    hidden: true,
    execute: openPalette,
  })

  useRegisterCommand({
    id: 'command-palette.open-ctrl',
    label: 'Open Command Palette',
    keybinding: { key: 'k', modifiers: ['ctrl'] },
    contexts: ['global'],
    hidden: true,
    execute: openPalette,
  })

  useRegisterCommand({
    id: 'navigate.pods',
    label: 'Go to Pods',
    chord: { keys: ['g', 'p'] },
    contexts: ['global'],
    execute: () => navigate(ROUTES.PODS),
  })

  useRegisterCommand({
    id: 'navigate.deployments',
    label: 'Go to Deployments',
    chord: { keys: ['g', 'd'] },
    contexts: ['global'],
    execute: () => navigate(ROUTES.DEPLOYMENTS),
  })

  useRegisterCommand({
    id: 'navigate.services',
    label: 'Go to Services',
    chord: { keys: ['g', 's'] },
    contexts: ['global'],
    execute: () => navigate(ROUTES.SERVICES),
  })

  useRegisterCommand({
    id: 'navigate.configmaps',
    label: 'Go to ConfigMaps',
    chord: { keys: ['g', 'c'] },
    contexts: ['global'],
    execute: () => navigate(ROUTES.CONFIGMAPS),
  })

  useRegisterCommand({
    id: 'navigate.secrets',
    label: 'Go to Secrets',
    chord: { keys: ['g', 'x'] },
    contexts: ['global'],
    execute: () => navigate(ROUTES.SECRETS),
  })

  useRegisterCommand({
    id: 'navigate.nodes',
    label: 'Go to Nodes',
    chord: { keys: ['g', 'n'] },
    contexts: ['global'],
    execute: () => navigate(ROUTES.NODES),
  })

  useRegisterCommand({
    id: 'navigate.dashboard',
    label: 'Go to Dashboard',
    chord: { keys: ['g', 'h'] },
    contexts: ['global'],
    execute: () => navigate(ROUTES.DASHBOARD),
  })

  const visibleCommands = useMemo(() => {
    return commandRegistry.getVisible()
  }, [])

  const filteredResults = useMemo(() => {
    return fuzzyFilter(visibleCommands, query, (cmd) => cmd.label)
  }, [visibleCommands, query])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(Math.min(selectedIndex + 1, filteredResults.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(Math.max(selectedIndex - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredResults[selectedIndex]) {
            filteredResults[selectedIndex].item.execute()
            closePalette()
          }
          break
        case 'Escape':
          e.preventDefault()
          closePalette()
          break
      }
    },
    [selectedIndex, filteredResults, setSelectedIndex, closePalette]
  )

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.querySelector('[data-selected="true"]')
      selectedItem?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const handleItemClick = useCallback(
    (command: Command) => {
      command.execute()
      closePalette()
    },
    [closePalette]
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? openPalette() : closePalette())}>
      <DialogContent className="p-0 max-w-xl top-[20%] translate-y-0" onKeyDown={handleKeyDown}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <Search className="h-4 w-4 text-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          <Kbd>Esc</Kbd>
        </div>
        <ScrollArea className="max-h-80">
          <div ref={listRef} className="p-2">
            {filteredResults.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-text-tertiary">
                No commands found
              </div>
            ) : (
              filteredResults.map(({ item, indices }, index) => (
                <CommandPaletteItem
                  key={item.id}
                  command={item}
                  isSelected={index === selectedIndex}
                  matchIndices={indices}
                  onClick={() => handleItemClick(item)}
                  data-selected={index === selectedIndex}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
