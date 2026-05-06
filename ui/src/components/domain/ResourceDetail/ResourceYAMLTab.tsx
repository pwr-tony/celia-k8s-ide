import { useResourceYAML } from '@/api/hooks'
import Editor from '@monaco-editor/react'
import { Loader2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/primitives'

interface ResourceYAMLTabProps {
  kind: string
  namespace: string
  name: string
}

export function ResourceYAMLTab({ kind, namespace, name }: ResourceYAMLTabProps) {
  const { data, isLoading, error } = useResourceYAML(kind, namespace, name)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (data?.yaml) {
      await navigator.clipboard.writeText(data.yaml)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
      </div>
    )
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
      <div className="flex items-center justify-end p-2 border-b border-border-subtle bg-bg-tertiary">
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
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="yaml"
          value={data?.yaml ?? ''}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  )
}
