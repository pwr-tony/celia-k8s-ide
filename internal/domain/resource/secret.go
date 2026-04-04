package resource

type SecretType string

const (
	SecretTypeOpaque              SecretType = "Opaque"
	SecretTypeServiceAccountToken SecretType = "kubernetes.io/service-account-token"
	SecretTypeDockerConfigJSON    SecretType = "kubernetes.io/dockerconfigjson"
	SecretTypeTLS                 SecretType = "kubernetes.io/tls"
	SecretTypeBasicAuth           SecretType = "kubernetes.io/basic-auth"
	SecretTypeSSHAuth             SecretType = "kubernetes.io/ssh-auth"
)

type Secret struct {
	Resource

	Type SecretType

	Data map[string]SecretValue

	Immutable bool
}

type SecretValue struct {
	Value []byte

	Masked bool

	Size int
}

func NewSecret() *Secret {
	return &Secret{
		Data: make(map[string]SecretValue),
	}
}

func (s *Secret) Keys() []string {
	keys := make([]string, 0, len(s.Data))
	for k := range s.Data {
		keys = append(keys, k)
	}
	return keys
}

func (s *Secret) DataCount() int {
	return len(s.Data)
}

func (s *Secret) IsTLS() bool {
	return s.Type == SecretTypeTLS
}

func (s *Secret) IsDockerConfig() bool {
	return s.Type == SecretTypeDockerConfigJSON
}

func MaskedString(length int) string {
	if length <= 0 {
		return "********"
	}
	return "********"
}
