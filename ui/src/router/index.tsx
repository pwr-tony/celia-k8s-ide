import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './Layout'
import { ROUTES } from './routes'
import { Dashboard } from '@/pages/Dashboard'
import { NotFound } from '@/pages/NotFound'
import { PodListPage } from '@/pages/pods/PodListPage'
import { PodDetailPage } from '@/pages/pods/PodDetailPage'
import { DeploymentListPage } from '@/pages/deployments/DeploymentListPage'
import { DeploymentDetailPage } from '@/pages/deployments/DeploymentDetailPage'
import { ServiceListPage } from '@/pages/services/ServiceListPage'
import { ServiceDetailPage } from '@/pages/services/ServiceDetailPage'
import { ConfigMapListPage } from '@/pages/configmaps/ConfigMapListPage'
import { ConfigMapDetailPage } from '@/pages/configmaps/ConfigMapDetailPage'
import { SecretListPage } from '@/pages/secrets/SecretListPage'
import { SecretDetailPage } from '@/pages/secrets/SecretDetailPage'
import { NodeListPage } from '@/pages/nodes/NodeListPage'
import { NodeDetailPage } from '@/pages/nodes/NodeDetailPage'
import { PVListPage } from '@/pages/persistentvolumes/PVListPage'
import { PVDetailPage } from '@/pages/persistentvolumes/PVDetailPage'
import { PVCListPage } from '@/pages/persistentvolumeclaims/PVCListPage'
import { PVCDetailPage } from '@/pages/persistentvolumeclaims/PVCDetailPage'
import { IngressListPage } from '@/pages/ingresses/IngressListPage'
import { IngressDetailPage } from '@/pages/ingresses/IngressDetailPage'
import { AuditLogPage } from '@/pages/AuditLogPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: ROUTES.PODS, element: <PodListPage /> },
      { path: ROUTES.POD_DETAIL, element: <PodDetailPage /> },
      { path: ROUTES.DEPLOYMENTS, element: <DeploymentListPage /> },
      { path: ROUTES.DEPLOYMENT_DETAIL, element: <DeploymentDetailPage /> },
      { path: ROUTES.SERVICES, element: <ServiceListPage /> },
      { path: ROUTES.SERVICE_DETAIL, element: <ServiceDetailPage /> },
      { path: ROUTES.CONFIGMAPS, element: <ConfigMapListPage /> },
      { path: ROUTES.CONFIGMAP_DETAIL, element: <ConfigMapDetailPage /> },
      { path: ROUTES.SECRETS, element: <SecretListPage /> },
      { path: ROUTES.SECRET_DETAIL, element: <SecretDetailPage /> },
      { path: ROUTES.NODES, element: <NodeListPage /> },
      { path: ROUTES.NODE_DETAIL, element: <NodeDetailPage /> },
      { path: ROUTES.PERSISTENT_VOLUMES, element: <PVListPage /> },
      { path: ROUTES.PERSISTENT_VOLUME_DETAIL, element: <PVDetailPage /> },
      { path: ROUTES.PERSISTENT_VOLUME_CLAIMS, element: <PVCListPage /> },
      { path: ROUTES.PERSISTENT_VOLUME_CLAIM_DETAIL, element: <PVCDetailPage /> },
      { path: ROUTES.INGRESSES, element: <IngressListPage /> },
      { path: ROUTES.INGRESS_DETAIL, element: <IngressDetailPage /> },
      { path: ROUTES.AUDIT_LOG, element: <AuditLogPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
