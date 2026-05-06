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
      { path: '*', element: <NotFound /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
