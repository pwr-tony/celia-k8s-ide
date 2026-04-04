package cluster

type Context struct {
	Name        string
	Cluster     string
	User        string
	Namespace   string
	IsCurrent   bool
	IsConnected bool
}

type ContextList struct {
	Contexts       []Context
	CurrentContext string
}

func (cl *ContextList) FindByName(name string) *Context {
	for i := range cl.Contexts {
		if cl.Contexts[i].Name == name {
			return &cl.Contexts[i]
		}
	}
	return nil
}

func (cl *ContextList) GetCurrent() *Context {
	return cl.FindByName(cl.CurrentContext)
}
