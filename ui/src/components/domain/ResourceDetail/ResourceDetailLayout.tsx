import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/primitives'
import { ResourceDetailHeader } from './ResourceDetailHeader'
import type { Status } from '@/components/data'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface ResourceDetailLayoutProps {
  kind: string
  name: string
  namespace?: string
  status?: string
  statusType?: Status
  breadcrumbs: BreadcrumbItem[]
  tabs: Tab[]
  actions?: React.ReactNode
  defaultTab?: string
}

export function ResourceDetailLayout({
  kind,
  name,
  namespace,
  status,
  statusType,
  breadcrumbs,
  tabs,
  actions,
  defaultTab,
}: ResourceDetailLayoutProps) {
  return (
    <>
      <ResourceDetailHeader
        kind={kind}
        name={name}
        namespace={namespace}
        status={status}
        statusType={statusType}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue={defaultTab ?? tabs[0]?.id} className="flex flex-col flex-1 min-h-0">
          <div className="px-4 sm:px-6 pt-4 border-b border-border-subtle bg-bg-secondary overflow-x-auto">
            <TabsList className="bg-transparent p-0 h-auto gap-4 min-w-max">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-none border-b-2 border-transparent px-0 pb-3 pt-0 data-[state=active]:border-accent-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="flex-1 overflow-hidden">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                {tab.content}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </main>
    </>
  )
}
