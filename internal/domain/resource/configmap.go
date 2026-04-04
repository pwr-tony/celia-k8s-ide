package resource

type ConfigMap struct {
	Resource

	Data map[string]string

	BinaryData map[string][]byte

	Immutable bool
}

func (c *ConfigMap) GetData(key string) (string, bool) {
	if c.Data == nil {
		return "", false
	}
	val, ok := c.Data[key]
	return val, ok
}

func (c *ConfigMap) GetBinaryData(key string) ([]byte, bool) {
	if c.BinaryData == nil {
		return nil, false
	}
	val, ok := c.BinaryData[key]
	return val, ok
}

func (c *ConfigMap) Keys() []string {
	keys := make([]string, 0, len(c.Data)+len(c.BinaryData))
	for k := range c.Data {
		keys = append(keys, k)
	}
	for k := range c.BinaryData {
		keys = append(keys, k)
	}
	return keys
}

func (c *ConfigMap) DataCount() int {
	return len(c.Data) + len(c.BinaryData)
}
