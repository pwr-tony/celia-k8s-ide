import { useSettingsStore } from '@/stores/settings'
import { Button } from '@/components/primitives'
import { AlertTriangle, AlertCircle, AlertOctagon, Info, RotateCcw } from 'lucide-react'

const severityOptions = [
  { value: 1, label: 'Low', icon: Info, color: 'text-text-tertiary' },
  { value: 2, label: 'Medium', icon: AlertTriangle, color: 'text-warning' },
  { value: 3, label: 'High', icon: AlertCircle, color: 'text-error' },
  { value: 4, label: 'Critical', icon: AlertOctagon, color: 'text-error' },
] as const

export function SeveritySettings() {
  const {
    notificationMinSeverity,
    highlightMinSeverity,
    soundEnabled,
    setSeverityThreshold,
    resetDefaults,
  } = useSettingsStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Severity Thresholds</h3>
          <p className="text-xs text-text-tertiary mt-1">
            Configure when to show notifications and highlights
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={resetDefaults}>
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-text-secondary mb-2 block">
            Minimum severity for notifications
          </label>
          <div className="flex gap-2">
            {severityOptions.map((opt) => {
              const Icon = opt.icon
              const isSelected = notificationMinSeverity === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setSeverityThreshold('notificationMinSeverity', opt.value)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md border transition-colors
                    ${isSelected
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border-subtle hover:border-border-default'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-accent' : opt.color}`} />
                  <span className="text-sm">{opt.label}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-text-tertiary mt-1.5">
            Problems with severity {notificationMinSeverity} and above will trigger notifications
          </p>
        </div>

        <div>
          <label className="text-sm text-text-secondary mb-2 block">
            Minimum severity for visual highlights
          </label>
          <div className="flex gap-2">
            {severityOptions.map((opt) => {
              const Icon = opt.icon
              const isSelected = highlightMinSeverity === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setSeverityThreshold('highlightMinSeverity', opt.value)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md border transition-colors
                    ${isSelected
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border-subtle hover:border-border-default'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-accent' : opt.color}`} />
                  <span className="text-sm">{opt.label}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-text-tertiary mt-1.5">
            Problems with severity {highlightMinSeverity} and above will be visually highlighted
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <div>
            <label className="text-sm text-text-secondary">Sound notifications</label>
            <p className="text-xs text-text-tertiary">Play a sound for critical problems</p>
          </div>
          <button
            onClick={() => setSeverityThreshold('soundEnabled', !soundEnabled)}
            className={`
              w-11 h-6 rounded-full transition-colors relative
              ${soundEnabled ? 'bg-accent' : 'bg-bg-tertiary'}
            `}
          >
            <span
              className={`
                absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                ${soundEnabled ? 'left-5' : 'left-0.5'}
              `}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
