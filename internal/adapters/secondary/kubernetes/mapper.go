package kubernetes

import (
	"time"

	"github.com/tonymora/celia/internal/domain/resource"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
)

func mapPod(pod *corev1.Pod) resource.Pod {
	p := resource.Pod{
		Resource: resource.Resource{
			Kind:        resource.KindPod,
			APIVersion:  "v1",
			Name:        pod.Name,
			Namespace:   pod.Namespace,
			UID:         string(pod.UID),
			Labels:      pod.Labels,
			Annotations: pod.Annotations,
			CreatedAt:   pod.CreationTimestamp.Time,
		},
		Phase:         resource.PodPhase(pod.Status.Phase),
		PodIP:         pod.Status.PodIP,
		NodeName:      pod.Spec.NodeName,
		HostIP:        pod.Status.HostIP,
		QOSClass:      string(pod.Status.QOSClass),
		RestartPolicy: string(pod.Spec.RestartPolicy),
	}

	if pod.Status.StartTime != nil {
		st := pod.Status.StartTime.Time
		p.StartTime = &st
	}

	containerStatusMap := make(map[string]corev1.ContainerStatus)
	for _, cs := range pod.Status.ContainerStatuses {
		containerStatusMap[cs.Name] = cs
	}

	for _, c := range pod.Spec.Containers {
		container := mapContainer(&c, containerStatusMap[c.Name])
		p.Containers = append(p.Containers, container)
		p.RestartCount += container.RestartCount
	}

	initContainerStatusMap := make(map[string]corev1.ContainerStatus)
	for _, cs := range pod.Status.InitContainerStatuses {
		initContainerStatusMap[cs.Name] = cs
	}

	for _, c := range pod.Spec.InitContainers {
		container := mapContainer(&c, initContainerStatusMap[c.Name])
		p.InitContainers = append(p.InitContainers, container)
	}

	for _, cond := range pod.Status.Conditions {
		p.Conditions = append(p.Conditions, resource.PodCondition{
			Type:               string(cond.Type),
			Status:             string(cond.Status),
			LastTransitionTime: cond.LastTransitionTime.Time,
			Reason:             cond.Reason,
			Message:            cond.Message,
		})
	}

	if len(pod.OwnerReferences) > 0 {
		owner := pod.OwnerReferences[0]
		p.OwnerKind = owner.Kind
		p.OwnerName = owner.Name
		p.OwnerUID = string(owner.UID)
	}

	return p
}

func mapContainer(spec *corev1.Container, status corev1.ContainerStatus) resource.Container {
	c := resource.Container{
		Name:         spec.Name,
		Image:        spec.Image,
		Ready:        status.Ready,
		Started:      status.Started != nil && *status.Started,
		RestartCount: status.RestartCount,
	}

	if spec.Resources.Requests != nil {
		if cpu, ok := spec.Resources.Requests[corev1.ResourceCPU]; ok {
			c.Resources.CPURequest = cpu.String()
		}
		if mem, ok := spec.Resources.Requests[corev1.ResourceMemory]; ok {
			c.Resources.MemoryRequest = mem.String()
		}
	}
	if spec.Resources.Limits != nil {
		if cpu, ok := spec.Resources.Limits[corev1.ResourceCPU]; ok {
			c.Resources.CPULimit = cpu.String()
		}
		if mem, ok := spec.Resources.Limits[corev1.ResourceMemory]; ok {
			c.Resources.MemoryLimit = mem.String()
		}
	}

	c.State = mapContainerState(status.State)
	c.LastState = mapContainerState(status.LastTerminationState)

	return c
}

func mapContainerState(state corev1.ContainerState) resource.ContainerState {
	cs := resource.ContainerState{}

	if state.Waiting != nil {
		cs.Type = resource.ContainerStateWaiting
		cs.Reason = state.Waiting.Reason
		cs.Message = state.Waiting.Message
	} else if state.Running != nil {
		cs.Type = resource.ContainerStateRunning
		st := state.Running.StartedAt.Time
		cs.StartedAt = &st
	} else if state.Terminated != nil {
		cs.Type = resource.ContainerStateTerminated
		cs.Reason = state.Terminated.Reason
		cs.Message = state.Terminated.Message
		cs.ExitCode = state.Terminated.ExitCode
		st := state.Terminated.StartedAt.Time
		cs.StartedAt = &st
		ft := state.Terminated.FinishedAt.Time
		cs.FinishedAt = &ft
	}

	return cs
}

func mapDeployment(dep *appsv1.Deployment) resource.Deployment {
	d := resource.Deployment{
		Resource: resource.Resource{
			Kind:        resource.KindDeployment,
			APIVersion:  "apps/v1",
			Name:        dep.Name,
			Namespace:   dep.Namespace,
			UID:         string(dep.UID),
			Labels:      dep.Labels,
			Annotations: dep.Annotations,
			CreatedAt:   dep.CreationTimestamp.Time,
		},
		Selector:            dep.Spec.Selector.MatchLabels,
		MinReadySeconds:     dep.Spec.MinReadySeconds,
		ReadyReplicas:       dep.Status.ReadyReplicas,
		AvailableReplicas:   dep.Status.AvailableReplicas,
		UpdatedReplicas:     dep.Status.UpdatedReplicas,
		UnavailableReplicas: dep.Status.UnavailableReplicas,
		ObservedGeneration:  dep.Status.ObservedGeneration,
	}

	if dep.Spec.Replicas != nil {
		d.Replicas = *dep.Spec.Replicas
	}

	d.Strategy.Type = string(dep.Spec.Strategy.Type)
	if dep.Spec.Strategy.RollingUpdate != nil {
		if dep.Spec.Strategy.RollingUpdate.MaxUnavailable != nil {
			d.Strategy.MaxUnavailable = dep.Spec.Strategy.RollingUpdate.MaxUnavailable.String()
		}
		if dep.Spec.Strategy.RollingUpdate.MaxSurge != nil {
			d.Strategy.MaxSurge = dep.Spec.Strategy.RollingUpdate.MaxSurge.String()
		}
	}

	for _, cond := range dep.Status.Conditions {
		d.Conditions = append(d.Conditions, resource.DeploymentCondition{
			Type:               string(cond.Type),
			Status:             string(cond.Status),
			LastTransitionTime: cond.LastTransitionTime.Time,
			LastUpdateTime:     cond.LastUpdateTime.Time,
			Reason:             cond.Reason,
			Message:            cond.Message,
		})
	}

	return d
}

func mapService(svc *corev1.Service) resource.Service {
	s := resource.Service{
		Resource: resource.Resource{
			Kind:        resource.KindService,
			APIVersion:  "v1",
			Name:        svc.Name,
			Namespace:   svc.Namespace,
			UID:         string(svc.UID),
			Labels:      svc.Labels,
			Annotations: svc.Annotations,
			CreatedAt:   svc.CreationTimestamp.Time,
		},
		Type:         resource.ServiceType(svc.Spec.Type),
		ClusterIP:    svc.Spec.ClusterIP,
		ClusterIPs:   svc.Spec.ClusterIPs,
		ExternalIPs:  svc.Spec.ExternalIPs,
		Selector:     svc.Spec.Selector,
		ExternalName: svc.Spec.ExternalName,
	}

	if svc.Spec.LoadBalancerIP != "" {
		s.LoadBalancerIP = svc.Spec.LoadBalancerIP
	}

	for _, p := range svc.Spec.Ports {
		s.Ports = append(s.Ports, resource.ServicePort{
			Name:       p.Name,
			Protocol:   string(p.Protocol),
			Port:       p.Port,
			TargetPort: p.TargetPort.String(),
			NodePort:   p.NodePort,
		})
	}

	for _, ing := range svc.Status.LoadBalancer.Ingress {
		s.LoadBalancerIngress = append(s.LoadBalancerIngress, resource.LoadBalancerIngress{
			IP:       ing.IP,
			Hostname: ing.Hostname,
		})
	}

	return s
}

func mapConfigMap(cm *corev1.ConfigMap) resource.ConfigMap {
	c := resource.ConfigMap{
		Resource: resource.Resource{
			Kind:        resource.KindConfigMap,
			APIVersion:  "v1",
			Name:        cm.Name,
			Namespace:   cm.Namespace,
			UID:         string(cm.UID),
			Labels:      cm.Labels,
			Annotations: cm.Annotations,
			CreatedAt:   cm.CreationTimestamp.Time,
		},
		Data:       cm.Data,
		BinaryData: cm.BinaryData,
	}

	if cm.Immutable != nil {
		c.Immutable = *cm.Immutable
	}

	return c
}

func mapSecret(secret *corev1.Secret, reveal bool) resource.Secret {
	s := resource.Secret{
		Resource: resource.Resource{
			Kind:        resource.KindSecret,
			APIVersion:  "v1",
			Name:        secret.Name,
			Namespace:   secret.Namespace,
			UID:         string(secret.UID),
			Labels:      secret.Labels,
			Annotations: secret.Annotations,
			CreatedAt:   secret.CreationTimestamp.Time,
		},
		Type: resource.SecretType(secret.Type),
		Data: make(map[string]resource.SecretValue),
	}

	if secret.Immutable != nil {
		s.Immutable = *secret.Immutable
	}

	for key, value := range secret.Data {
		sv := resource.SecretValue{
			Size:   len(value),
			Masked: !reveal,
		}
		if reveal {
			sv.Value = value
		}
		s.Data[key] = sv
	}

	return s
}

func mapNode(node *corev1.Node) resource.Node {
	n := resource.Node{
		Resource: resource.Resource{
			Kind:        resource.KindNode,
			APIVersion:  "v1",
			Name:        node.Name,
			UID:         string(node.UID),
			Labels:      node.Labels,
			Annotations: node.Annotations,
			CreatedAt:   node.CreationTimestamp.Time,
		},
		PodCIDR:       node.Spec.PodCIDR,
		PodCIDRs:      node.Spec.PodCIDRs,
		Unschedulable: node.Spec.Unschedulable,
	}

	for _, t := range node.Spec.Taints {
		n.Taints = append(n.Taints, resource.Taint{
			Key:    t.Key,
			Value:  t.Value,
			Effect: string(t.Effect),
		})
	}

	for _, cond := range node.Status.Conditions {
		n.Conditions = append(n.Conditions, resource.NodeCondition{
			Type:               string(cond.Type),
			Status:             string(cond.Status),
			LastHeartbeatTime:  cond.LastHeartbeatTime.Time,
			LastTransitionTime: cond.LastTransitionTime.Time,
			Reason:             cond.Reason,
			Message:            cond.Message,
		})
	}

	for _, addr := range node.Status.Addresses {
		n.Addresses = append(n.Addresses, resource.NodeAddress{
			Type:    string(addr.Type),
			Address: addr.Address,
		})
	}

	if cpu, ok := node.Status.Capacity[corev1.ResourceCPU]; ok {
		n.Capacity.CPU = cpu.String()
	}
	if mem, ok := node.Status.Capacity[corev1.ResourceMemory]; ok {
		n.Capacity.Memory = mem.String()
	}
	if pods, ok := node.Status.Capacity[corev1.ResourcePods]; ok {
		n.Capacity.Pods = pods.String()
	}
	if storage, ok := node.Status.Capacity[corev1.ResourceEphemeralStorage]; ok {
		n.Capacity.EphemeralStorage = storage.String()
	}

	if cpu, ok := node.Status.Allocatable[corev1.ResourceCPU]; ok {
		n.Allocatable.CPU = cpu.String()
	}
	if mem, ok := node.Status.Allocatable[corev1.ResourceMemory]; ok {
		n.Allocatable.Memory = mem.String()
	}
	if pods, ok := node.Status.Allocatable[corev1.ResourcePods]; ok {
		n.Allocatable.Pods = pods.String()
	}
	if storage, ok := node.Status.Allocatable[corev1.ResourceEphemeralStorage]; ok {
		n.Allocatable.EphemeralStorage = storage.String()
	}

	n.KubeletVersion = node.Status.NodeInfo.KubeletVersion
	n.ContainerRuntimeVersion = node.Status.NodeInfo.ContainerRuntimeVersion
	n.OSImage = node.Status.NodeInfo.OSImage
	n.Architecture = node.Status.NodeInfo.Architecture
	n.KernelVersion = node.Status.NodeInfo.KernelVersion

	return n
}

func mapEvent(event *corev1.Event) resource.Event {
	e := resource.Event{
		Resource: resource.Resource{
			Kind:        resource.KindEvent,
			APIVersion:  "v1",
			Name:        event.Name,
			Namespace:   event.Namespace,
			UID:         string(event.UID),
			CreatedAt:   event.CreationTimestamp.Time,
		},
		Type:              resource.EventType(event.Type),
		Reason:            event.Reason,
		Message:           event.Message,
		Count:             event.Count,
		InvolvedKind:      event.InvolvedObject.Kind,
		InvolvedNamespace: event.InvolvedObject.Namespace,
		InvolvedName:      event.InvolvedObject.Name,
		InvolvedUID:       string(event.InvolvedObject.UID),
		SourceComponent:   event.Source.Component,
		SourceHost:        event.Source.Host,
		FirstTimestamp:    event.FirstTimestamp.Time,
		LastTimestamp:     event.LastTimestamp.Time,
	}

	if e.FirstTimestamp.IsZero() && event.EventTime.Time != (time.Time{}) {
		e.FirstTimestamp = event.EventTime.Time
		e.LastTimestamp = event.EventTime.Time
	}

	return e
}
