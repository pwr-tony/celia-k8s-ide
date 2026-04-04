package cluster

import "time"

type ConnectionState string

const (
	ConnectionStateDisconnected ConnectionState = "disconnected"
	ConnectionStateConnecting   ConnectionState = "connecting"
	ConnectionStateConnected    ConnectionState = "connected"
	ConnectionStateFailed       ConnectionState = "failed"
)

type Connection struct {
	ContextName string
	State       ConnectionState
	ConnectedAt time.Time
	Namespace   string
	ServerURL   string
	Error       string
}

func (c *Connection) IsConnected() bool {
	return c.State == ConnectionStateConnected
}

func NewConnection() *Connection {
	return &Connection{
		State: ConnectionStateDisconnected,
	}
}

func (c *Connection) Connect(contextName, namespace, serverURL string) {
	c.ContextName = contextName
	c.State = ConnectionStateConnected
	c.ConnectedAt = time.Now()
	c.Namespace = namespace
	c.ServerURL = serverURL
	c.Error = ""
}

func (c *Connection) Disconnect() {
	c.State = ConnectionStateDisconnected
	c.ContextName = ""
	c.Namespace = ""
	c.ServerURL = ""
}

func (c *Connection) Fail(err string) {
	c.State = ConnectionStateFailed
	c.Error = err
}
