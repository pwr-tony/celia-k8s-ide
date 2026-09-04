import { useResourceYAML, useUpdateResource } from '@/api/hooks'
import Editor, { type OnMount } from '@monaco-editor/react'
import { Copy, Check, Pencil, X, Save } from 'lucide-react'
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Button, Kbd } from '@/components/primitives'
import { useKeyboardContext, useKeyboardEnabled } from '@/lib/keyboard'
import { YAMLConfirmDialog } from './YAMLConfirmDialog'
import { YAMLSkeleton } from '@/components/data'

type MonacoEditor = Parameters<OnMount>[0]

interface ResourceYAMLTabProps {
  kind: string
  namespace: string
  name: string
}

export function ResourceYAMLTab({ kind, namespace, name }: ResourceYAMLTabProps) {
  const { data, isLoading, error, refetch } = useResourceYAML(kind, namespace, name)
  const updateMutation = useUpdateResource()
  const [copied, setCopied] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedYaml, setEditedYaml] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const editorRef = useRef<MonacoEditor | null>(null)
  const { setActiveContext } = useKeyboardContext()
  const initialYaml = useMemo(() => data?.yaml ?? '', [data?.yaml])

  useKeyboardEnabled(!isEditMode)

  useEffect(() => {
    if (isEditMode) {
      setActiveContext('editor')
    } else {
      setActiveContext('detail')
    }
  }, [isEditMode, setActiveContext])

  const handleCopy = useCallback(async () => {
    const yamlToCopy = isEditMode ? editedYaml : initialYaml
    if (yamlToCopy) {
      await navigator.clipboard.writeText(yamlToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [initialYaml, editedYaml, isEditMode])

  const enterEditMode = useCallback(() => {
    if (initialYaml) {
      setEditedYaml(initialYaml)
      setIsEditMode(true)
    }
  }, [initialYaml])

  const cancelEdit = useCallback(() => {
    setIsEditMode(false)
    setEditedYaml(initialYaml)
  }, [initialYaml])

  const handleSave = useCallback(() => {
    setShowConfirmDialog(true)
  }, [])

  const confirmSave = useCallback(async () => {
    await updateMutation.mutateAsync({
      kind,
      namespace,
      name,
      yaml: editedYaml,
    })
    setShowConfirmDialog(false)
    setIsEditMode(false)
    refetch()
  }, [kind, namespace, name, editedYaml, updateMutation, refetch])

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor

    const isMac = window.navigator.platform.includes('Mac')
    const modKey = isMac ? 2048 : 1024
    editor.addCommand(modKey | 49, () => {
      setShowConfirmDialog(true)
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode) {
        if (e.key === 'e' && !e.metaKey && !e.ctrlKey) {
          const target = e.target as HTMLElement
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            e.preventDefault()
            enterEditMode()
          }
        }
        if (e.key === 'y' && !e.metaKey && !e.ctrlKey) {
          const target = e.target as HTMLElement
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            e.preventDefault()
            handleCopy()
          }
        }
      } else {
        if (e.key === 'Escape') {
          e.preventDefault()
          cancelEdit()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditMode, enterEditMode, cancelEdit, handleCopy])

  if (isLoading) {
    return <YAMLSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-error">
        Failed to load YAML: {error.message}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b border-border-subtle bg-bg-tertiary">
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          {isEditMode ? (
            <>
              <span className="text-warning font-medium">Editing</span>
              <span className="flex items-center gap-1">
                <Kbd>{'\u2318'}</Kbd><Kbd>S</Kbd> save
              </span>
              <span className="flex items-center gap-1">
                <Kbd>Esc</Kbd> cancel
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <Kbd>E</Kbd> edit
              </span>
              <span className="flex items-center gap-1">
                <Kbd>Y</Kbd> copy
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="secondary" size="sm" onClick={enterEditMode}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="yaml"
          value={isEditMode ? editedYaml : initialYaml}
          onChange={(value) => isEditMode && setEditedYaml(value ?? '')}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            readOnly: !isEditMode,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            renderValidationDecorations: isEditMode ? 'on' : 'off',
          }}
        />
      </div>
      <YAMLConfirmDialog
        open={showConfirmDialog}
        onConfirm={confirmSave}
        onCancel={() => setShowConfirmDialog(false)}
        resourceKind={kind}
        resourceName={name}
        isLoading={updateMutation.isPending}
      />
    </div>
  )
}
