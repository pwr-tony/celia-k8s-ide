import { ScrollArea } from '@/components/primitives'
import { TooltipProvider } from '@/components/primitives'
import { ClusterSelector } from '@/components/navigation/ClusterSelector'
import { NamespaceSelector } from '@/components/navigation/NamespaceSelector'
import { CategoryGroup } from '@/components/navigation/CategoryGroup'
import { NavItem } from '@/components/navigation/NavItem'
import { useSidebarData } from '@/api/hooks/useSidebarData'
import {
  Box,
  Layers,
  Server,
  Network,
  Settings2,
  HardDrive,
  Activity,
  AlertTriangle,
  FileText,
  Calendar,
  Globe,
  ArrowRightLeft,
  Lock,
  Database,
  Folder,
  ScrollText,
  Stethoscope,
} from 'lucide-react'

export function SidebarNav() {
  const { counts, problems } = useSidebarData()

  return (
    <ScrollArea className="flex-1">
      <TooltipProvider delayDuration={0}>
        <div className="p-2 space-y-1">
          <ClusterSelector />
          <NamespaceSelector />
        </div>

        <div className="px-2 pb-4 space-y-1">
          <CategoryGroup id="workloads" label="Workloads" icon={Layers}>
            <NavItem
              icon={Box}
              label="Pods"
              resourceType="pods"
              count={counts.pods}
              problemCount={problems.pods}
            />
            <NavItem
              icon={Server}
              label="Deployments"
              resourceType="deployments"
              count={counts.deployments}
              problemCount={problems.deployments}
            />
            <NavItem
              icon={Server}
              label="StatefulSets"
              resourceType="statefulsets"
              count={counts.statefulsets}
            />
            <NavItem
              icon={Server}
              label="DaemonSets"
              resourceType="daemonsets"
              count={counts.daemonsets}
            />
            <NavItem
              icon={Calendar}
              label="Jobs"
              resourceType="jobs"
              count={counts.jobs}
            />
            <NavItem
              icon={Calendar}
              label="CronJobs"
              resourceType="cronjobs"
              count={counts.cronjobs}
            />
          </CategoryGroup>

          <CategoryGroup id="network" label="Network" icon={Network}>
            <NavItem
              icon={Globe}
              label="Services"
              resourceType="services"
              count={counts.services}
            />
            <NavItem
              icon={ArrowRightLeft}
              label="Ingresses"
              resourceType="ingresses"
              count={counts.ingresses}
            />
            <NavItem
              icon={Network}
              label="Endpoints"
              resourceType="endpoints"
              count={counts.endpoints}
            />
          </CategoryGroup>

          <CategoryGroup id="config" label="Config" icon={Settings2}>
            <NavItem
              icon={FileText}
              label="ConfigMaps"
              resourceType="configmaps"
              count={counts.configmaps}
            />
            <NavItem
              icon={Lock}
              label="Secrets"
              resourceType="secrets"
              count={counts.secrets}
            />
          </CategoryGroup>

          <CategoryGroup id="storage" label="Storage" icon={HardDrive}>
            <NavItem
              icon={Database}
              label="PVCs"
              resourceType="persistentvolumeclaims"
              count={counts.pvcs}
            />
            <NavItem
              icon={HardDrive}
              label="PVs"
              resourceType="persistentvolumes"
              count={counts.pvs}
            />
          </CategoryGroup>

          <CategoryGroup id="cluster" label="Cluster" icon={Server}>
            <NavItem
              icon={Server}
              label="Nodes"
              resourceType="nodes"
              count={counts.nodes}
              problemCount={problems.nodes}
            />
            <NavItem
              icon={Folder}
              label="Namespaces"
              resourceType="namespaces"
              count={counts.namespaces}
            />
          </CategoryGroup>

          <CategoryGroup id="observability" label="Observability" icon={Activity}>
            <NavItem
              icon={ScrollText}
              label="Events"
              resourceType="events"
            />
            <NavItem
              icon={FileText}
              label="Logs"
              resourceType="logs"
            />
          </CategoryGroup>

          <CategoryGroup id="troubleshooting" label="Troubleshooting" icon={AlertTriangle}>
            <NavItem
              icon={AlertTriangle}
              label="Problems"
              resourceType="problems"
              problemCount={problems.total}
            />
            <NavItem
              icon={Stethoscope}
              label="Diagnosis"
              resourceType="diagnosis"
            />
          </CategoryGroup>
        </div>
      </TooltipProvider>
    </ScrollArea>
  )
}
