package resource

type Ingress struct {
	Resource

	IngressClassName string
	DefaultBackend   *IngressBackend
	TLS              []IngressTLS
	Rules            []IngressRule
	LoadBalancerIPs  []string
}

type IngressBackend struct {
	ServiceName string
	ServicePort string
}

type IngressTLS struct {
	Hosts      []string
	SecretName string
}

type IngressRule struct {
	Host  string
	Paths []IngressPath
}

type IngressPath struct {
	Path        string
	PathType    string
	ServiceName string
	ServicePort string
}

func (i *Ingress) GetHosts() []string {
	hosts := make([]string, 0)
	seen := make(map[string]bool)
	for _, rule := range i.Rules {
		if rule.Host != "" && !seen[rule.Host] {
			hosts = append(hosts, rule.Host)
			seen[rule.Host] = true
		}
	}
	return hosts
}

func (i *Ingress) HasTLS() bool {
	return len(i.TLS) > 0
}

func (i *Ingress) GetTLSHosts() []string {
	hosts := make([]string, 0)
	seen := make(map[string]bool)
	for _, tls := range i.TLS {
		for _, host := range tls.Hosts {
			if !seen[host] {
				hosts = append(hosts, host)
				seen[host] = true
			}
		}
	}
	return hosts
}

func (i *Ingress) HasDefaultBackend() bool {
	return i.DefaultBackend != nil
}

func (i *Ingress) GetPaths() []IngressPath {
	paths := make([]IngressPath, 0)
	for _, rule := range i.Rules {
		paths = append(paths, rule.Paths...)
	}
	return paths
}
