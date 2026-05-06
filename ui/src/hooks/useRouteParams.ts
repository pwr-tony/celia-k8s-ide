import { useParams } from 'react-router'

interface NamespacedResourceParams {
  namespace: string
  name: string
}

interface ClusterResourceParams {
  name: string
}

export function useNamespacedResourceParams(): NamespacedResourceParams {
  const { namespace, name } = useParams<{ namespace: string; name: string }>()
  return {
    namespace: namespace ?? '',
    name: name ?? '',
  }
}

export function useClusterResourceParams(): ClusterResourceParams {
  const { name } = useParams<{ name: string }>()
  return {
    name: name ?? '',
  }
}
