package kubernetes

import (
	"context"
	"fmt"

	"github.com/tonymora/celia/internal/domain/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/dynamic"
	"sigs.k8s.io/yaml"
)

func (a *Adapter) ListResources(ctx context.Context, kind resource.Kind, namespace string) ([]resource.Resource, error) {
	switch kind {
	case resource.KindPod:
		pods, err := a.ListPods(ctx, namespace)
		if err != nil {
			return nil, err
		}
		result := make([]resource.Resource, len(pods))
		for i, p := range pods {
			result[i] = p.Resource
		}
		return result, nil

	case resource.KindDeployment:
		deployments, err := a.ListDeployments(ctx, namespace)
		if err != nil {
			return nil, err
		}
		result := make([]resource.Resource, len(deployments))
		for i, d := range deployments {
			result[i] = d.Resource
		}
		return result, nil

	case resource.KindService:
		services, err := a.ListServices(ctx, namespace)
		if err != nil {
			return nil, err
		}
		result := make([]resource.Resource, len(services))
		for i, s := range services {
			result[i] = s.Resource
		}
		return result, nil

	case resource.KindConfigMap:
		configMaps, err := a.ListConfigMaps(ctx, namespace)
		if err != nil {
			return nil, err
		}
		result := make([]resource.Resource, len(configMaps))
		for i, c := range configMaps {
			result[i] = c.Resource
		}
		return result, nil

	case resource.KindSecret:
		secrets, err := a.ListSecrets(ctx, namespace)
		if err != nil {
			return nil, err
		}
		result := make([]resource.Resource, len(secrets))
		for i, s := range secrets {
			result[i] = s.Resource
		}
		return result, nil

	case resource.KindNode:
		nodes, err := a.ListNodes(ctx)
		if err != nil {
			return nil, err
		}
		result := make([]resource.Resource, len(nodes))
		for i, n := range nodes {
			result[i] = n.Resource
		}
		return result, nil

	case resource.KindEvent:
		events, err := a.ListEvents(ctx, namespace)
		if err != nil {
			return nil, err
		}
		result := make([]resource.Resource, len(events))
		for i, e := range events {
			result[i] = e.Resource
		}
		return result, nil

	default:
		return nil, fmt.Errorf("unsupported resource kind: %s", kind)
	}
}

func (a *Adapter) GetResource(ctx context.Context, kind resource.Kind, namespace, name string) (*resource.Resource, error) {
	switch kind {
	case resource.KindPod:
		pod, err := a.GetPod(ctx, namespace, name)
		if err != nil {
			return nil, err
		}
		return &pod.Resource, nil

	case resource.KindDeployment:
		deployment, err := a.GetDeployment(ctx, namespace, name)
		if err != nil {
			return nil, err
		}
		return &deployment.Resource, nil

	case resource.KindService:
		service, err := a.GetService(ctx, namespace, name)
		if err != nil {
			return nil, err
		}
		return &service.Resource, nil

	case resource.KindConfigMap:
		configMap, err := a.GetConfigMap(ctx, namespace, name)
		if err != nil {
			return nil, err
		}
		return &configMap.Resource, nil

	case resource.KindSecret:
		secret, err := a.GetSecret(ctx, namespace, name, false)
		if err != nil {
			return nil, err
		}
		return &secret.Resource, nil

	case resource.KindNode:
		node, err := a.GetNode(ctx, name)
		if err != nil {
			return nil, err
		}
		return &node.Resource, nil

	default:
		return nil, fmt.Errorf("unsupported resource kind: %s", kind)
	}
}

func (a *Adapter) GetResourceYAML(ctx context.Context, kind resource.Kind, namespace, name string) (string, error) {
	restConfig, err := a.getRestConfig()
	if err != nil {
		return "", err
	}

	dynamicClient, err := dynamic.NewForConfig(restConfig)
	if err != nil {
		return "", fmt.Errorf("failed to create dynamic client: %w", err)
	}

	gvr := getGVR(kind)

	var obj *unstructured.Unstructured
	if kind.IsNamespaced() {
		obj, err = dynamicClient.Resource(gvr).Namespace(namespace).Get(ctx, name, metav1.GetOptions{})
	} else {
		obj, err = dynamicClient.Resource(gvr).Get(ctx, name, metav1.GetOptions{})
	}
	if err != nil {
		return "", fmt.Errorf("failed to get resource: %w", err)
	}

	obj.SetManagedFields(nil)

	yamlBytes, err := yaml.Marshal(obj.Object)
	if err != nil {
		return "", fmt.Errorf("failed to marshal to YAML: %w", err)
	}

	return string(yamlBytes), nil
}

func (a *Adapter) UpdateResource(ctx context.Context, kind resource.Kind, namespace, name string, yamlContent string) error {
	restConfig, err := a.getRestConfig()
	if err != nil {
		return err
	}

	dynamicClient, err := dynamic.NewForConfig(restConfig)
	if err != nil {
		return fmt.Errorf("failed to create dynamic client: %w", err)
	}

	var obj unstructured.Unstructured
	if err := yaml.Unmarshal([]byte(yamlContent), &obj.Object); err != nil {
		return fmt.Errorf("failed to unmarshal YAML: %w", err)
	}

	gvr := getGVR(kind)

	if kind.IsNamespaced() {
		_, err = dynamicClient.Resource(gvr).Namespace(namespace).Update(ctx, &obj, metav1.UpdateOptions{})
	} else {
		_, err = dynamicClient.Resource(gvr).Update(ctx, &obj, metav1.UpdateOptions{})
	}
	if err != nil {
		return fmt.Errorf("failed to update resource: %w", err)
	}

	return nil
}

func (a *Adapter) DeleteResource(ctx context.Context, kind resource.Kind, namespace, name string) error {
	restConfig, err := a.getRestConfig()
	if err != nil {
		return err
	}

	dynamicClient, err := dynamic.NewForConfig(restConfig)
	if err != nil {
		return fmt.Errorf("failed to create dynamic client: %w", err)
	}

	gvr := getGVR(kind)

	if kind.IsNamespaced() {
		err = dynamicClient.Resource(gvr).Namespace(namespace).Delete(ctx, name, metav1.DeleteOptions{})
	} else {
		err = dynamicClient.Resource(gvr).Delete(ctx, name, metav1.DeleteOptions{})
	}
	if err != nil {
		return fmt.Errorf("failed to delete resource: %w", err)
	}

	return nil
}

func (a *Adapter) WatchResources(ctx context.Context, kind resource.Kind, namespace string) (<-chan resource.WatchEvent, error) {
	restConfig, err := a.getRestConfig()
	if err != nil {
		return nil, err
	}

	dynamicClient, err := dynamic.NewForConfig(restConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create dynamic client: %w", err)
	}

	gvr := getGVR(kind)

	var watcher watch.Interface
	if kind.IsNamespaced() {
		watcher, err = dynamicClient.Resource(gvr).Namespace(namespace).Watch(ctx, metav1.ListOptions{})
	} else {
		watcher, err = dynamicClient.Resource(gvr).Watch(ctx, metav1.ListOptions{})
	}
	if err != nil {
		return nil, fmt.Errorf("failed to watch resources: %w", err)
	}

	eventChan := make(chan resource.WatchEvent, 100)

	go func() {
		defer close(eventChan)
		defer watcher.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case watchEvent, ok := <-watcher.ResultChan():
				if !ok {
					return
				}

				eventType := mapWatchEventType(watchEvent.Type)
				if eventType == "" {
					continue
				}

				if obj, ok := watchEvent.Object.(*unstructured.Unstructured); ok {
					eventChan <- resource.WatchEvent{
						Type: eventType,
						Resource: resource.Resource{
							Kind:      kind,
							Name:      obj.GetName(),
							Namespace: obj.GetNamespace(),
							UID:       string(obj.GetUID()),
							Labels:    obj.GetLabels(),
							CreatedAt: obj.GetCreationTimestamp().Time,
						},
					}
				}
			}
		}
	}()

	return eventChan, nil
}

func getGVR(kind resource.Kind) schema.GroupVersionResource {
	switch kind {
	case resource.KindPod:
		return schema.GroupVersionResource{Group: "", Version: "v1", Resource: "pods"}
	case resource.KindDeployment:
		return schema.GroupVersionResource{Group: "apps", Version: "v1", Resource: "deployments"}
	case resource.KindReplicaSet:
		return schema.GroupVersionResource{Group: "apps", Version: "v1", Resource: "replicasets"}
	case resource.KindStatefulSet:
		return schema.GroupVersionResource{Group: "apps", Version: "v1", Resource: "statefulsets"}
	case resource.KindDaemonSet:
		return schema.GroupVersionResource{Group: "apps", Version: "v1", Resource: "daemonsets"}
	case resource.KindService:
		return schema.GroupVersionResource{Group: "", Version: "v1", Resource: "services"}
	case resource.KindConfigMap:
		return schema.GroupVersionResource{Group: "", Version: "v1", Resource: "configmaps"}
	case resource.KindSecret:
		return schema.GroupVersionResource{Group: "", Version: "v1", Resource: "secrets"}
	case resource.KindNode:
		return schema.GroupVersionResource{Group: "", Version: "v1", Resource: "nodes"}
	case resource.KindEvent:
		return schema.GroupVersionResource{Group: "", Version: "v1", Resource: "events"}
	case resource.KindNamespace:
		return schema.GroupVersionResource{Group: "", Version: "v1", Resource: "namespaces"}
	case resource.KindIngress:
		return schema.GroupVersionResource{Group: "networking.k8s.io", Version: "v1", Resource: "ingresses"}
	case resource.KindJob:
		return schema.GroupVersionResource{Group: "batch", Version: "v1", Resource: "jobs"}
	case resource.KindCronJob:
		return schema.GroupVersionResource{Group: "batch", Version: "v1", Resource: "cronjobs"}
	default:
		return schema.GroupVersionResource{Group: "", Version: "v1", Resource: kind.Plural()}
	}
}

func mapWatchEventType(t watch.EventType) resource.WatchEventType {
	switch t {
	case watch.Added:
		return resource.WatchEventAdded
	case watch.Modified:
		return resource.WatchEventModified
	case watch.Deleted:
		return resource.WatchEventDeleted
	case watch.Error:
		return resource.WatchEventError
	default:
		return ""
	}
}
