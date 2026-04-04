package resource

type ServiceType string

const (
	ServiceTypeClusterIP    ServiceType = "ClusterIP"
	ServiceTypeNodePort     ServiceType = "NodePort"
	ServiceTypeLoadBalancer ServiceType = "LoadBalancer"
	ServiceTypeExternalName ServiceType = "ExternalName"
)

type Service struct {
	Resource

	Type         ServiceType
	ClusterIP    string
	ClusterIPs   []string
	ExternalIPs  []string
	Ports        []ServicePort
	Selector     map[string]string
	ExternalName string

	LoadBalancerIP string
	LoadBalancerIngress []LoadBalancerIngress
}

type ServicePort struct {
	Name       string
	Protocol   string
	Port       int32
	TargetPort string
	NodePort   int32
}

type LoadBalancerIngress struct {
	IP       string
	Hostname string
}

func (s *Service) HasSelector() bool {
	return len(s.Selector) > 0
}

func (s *Service) IsHeadless() bool {
	return s.ClusterIP == "None"
}

func (s *Service) GetPortByName(name string) *ServicePort {
	for i := range s.Ports {
		if s.Ports[i].Name == name {
			return &s.Ports[i]
		}
	}
	return nil
}

func (s *Service) GetExternalAddresses() []string {
	var addrs []string
	addrs = append(addrs, s.ExternalIPs...)
	for _, ing := range s.LoadBalancerIngress {
		if ing.IP != "" {
			addrs = append(addrs, ing.IP)
		}
		if ing.Hostname != "" {
			addrs = append(addrs, ing.Hostname)
		}
	}
	return addrs
}
