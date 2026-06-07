import { useState, useCallback, useEffect, type RefObject } from 'react'
import { useKeyboardContext } from '@/lib/keyboard'

interface UseTableKeyboardNavOptions<T> {
  items: T[]
  onSelect?: (item: T) => void
  tableRef?: RefObject<HTMLDivElement | null>
  searchInputRef?: RefObject<HTMLInputElement | null>
  scrollToIndex?: (index: number) => void
}

interface UseTableKeyboardNavResult {
  focusedIndex: number
  setFocusedIndex: (index: number) => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  isFocused: boolean
  setIsFocused: (focused: boolean) => void
}

export function useTableKeyboardNav<T>({
  items,
  onSelect,
  tableRef,
  searchInputRef,
  scrollToIndex,
}: UseTableKeyboardNavOptions<T>): UseTableKeyboardNavResult {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const { setActiveContext } = useKeyboardContext()

  useEffect(() => {
    if (isFocused) {
      setActiveContext('table')
    }
    return () => {
      if (isFocused) {
        setActiveContext('global')
      }
    }
  }, [isFocused, setActiveContext])

  const clampedIndex = focusedIndex >= items.length ? Math.max(0, items.length - 1) : focusedIndex
  if (clampedIndex !== focusedIndex && items.length > 0) {
    setFocusedIndex(clampedIndex)
  }

  const moveFocus = useCallback(
    (delta: number) => {
      const newIndex = Math.max(0, Math.min(items.length - 1, focusedIndex + delta))
      setFocusedIndex(newIndex)
      scrollToIndex?.(newIndex)
    },
    [focusedIndex, items.length, scrollToIndex]
  )

  const goToFirst = useCallback(() => {
    setFocusedIndex(0)
    scrollToIndex?.(0)
  }, [scrollToIndex])

  const goToLast = useCallback(() => {
    const lastIndex = items.length - 1
    setFocusedIndex(lastIndex)
    scrollToIndex?.(lastIndex)
  }, [items.length, scrollToIndex])

  const focusSearch = useCallback(() => {
    searchInputRef?.current?.focus()
  }, [searchInputRef])

  const selectCurrent = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < items.length) {
      onSelect?.(items[focusedIndex])
    }
  }, [focusedIndex, items, onSelect])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isFocused) return

      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      if (isInput && e.key !== 'Escape') return

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault()
          moveFocus(1)
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          moveFocus(-1)
          break
        case 'Enter':
          e.preventDefault()
          selectCurrent()
          break
        case 'G':
          if (e.shiftKey) {
            e.preventDefault()
            goToLast()
          }
          break
        case '/':
          e.preventDefault()
          focusSearch()
          break
        case 'Escape':
          e.preventDefault()
          setIsFocused(false)
          tableRef?.current?.blur()
          break
      }
    },
    [isFocused, moveFocus, selectCurrent, goToLast, focusSearch, tableRef]
  )

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return

      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      if (isInput) return

      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const handleSecondKey = (e2: KeyboardEvent) => {
          if (e2.key === 'g') {
            e2.preventDefault()
            goToFirst()
          }
          window.removeEventListener('keydown', handleSecondKey)
          clearTimeout(timeout)
        }
        const timeout = setTimeout(() => {
          window.removeEventListener('keydown', handleSecondKey)
        }, 500)
        window.addEventListener('keydown', handleSecondKey)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isFocused, goToFirst])

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    isFocused,
    setIsFocused,
  }
}
