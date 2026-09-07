package kubernetes

import (
	"context"
	"fmt"
	"io"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/tools/remotecommand"
)

type ExecOptions struct {
	Namespace string
	Pod       string
	Container string
	Command   []string
	Stdin     io.Reader
	Stdout    io.Writer
	Stderr    io.Writer
	TTY       bool
}

func (a *Adapter) Exec(ctx context.Context, opts ExecOptions) error {
	clientset, err := a.getClientset()
	if err != nil {
		return err
	}

	restConfig, err := a.getRestConfig()
	if err != nil {
		return err
	}

	req := clientset.CoreV1().RESTClient().Post().
		Resource("pods").
		Name(opts.Pod).
		Namespace(opts.Namespace).
		SubResource("exec").
		VersionedParams(&corev1.PodExecOptions{
			Container: opts.Container,
			Command:   opts.Command,
			Stdin:     opts.Stdin != nil,
			Stdout:    opts.Stdout != nil,
			Stderr:    opts.Stderr != nil,
			TTY:       opts.TTY,
		}, scheme.ParameterCodec)

	executor, err := remotecommand.NewSPDYExecutor(restConfig, "POST", req.URL())
	if err != nil {
		return fmt.Errorf("failed to create executor: %w", err)
	}

	streamOpts := remotecommand.StreamOptions{
		Stdin:  opts.Stdin,
		Stdout: opts.Stdout,
		Stderr: opts.Stderr,
		Tty:    opts.TTY,
	}

	return executor.StreamWithContext(ctx, streamOpts)
}

type TerminalSizeQueue interface {
	Next() *remotecommand.TerminalSize
}

type terminalSizeQueueImpl struct {
	resizeChan chan remotecommand.TerminalSize
}

func NewTerminalSizeQueue() *terminalSizeQueueImpl {
	return &terminalSizeQueueImpl{
		resizeChan: make(chan remotecommand.TerminalSize, 1),
	}
}

func (t *terminalSizeQueueImpl) Next() *remotecommand.TerminalSize {
	size, ok := <-t.resizeChan
	if !ok {
		return nil
	}
	return &size
}

func (t *terminalSizeQueueImpl) Resize(width, height uint16) {
	select {
	case t.resizeChan <- remotecommand.TerminalSize{Width: width, Height: height}:
	default:
	}
}

func (t *terminalSizeQueueImpl) Close() {
	close(t.resizeChan)
}

func (a *Adapter) ExecWithTerminalSize(ctx context.Context, opts ExecOptions, sizeQueue TerminalSizeQueue) error {
	clientset, err := a.getClientset()
	if err != nil {
		return err
	}

	restConfig, err := a.getRestConfig()
	if err != nil {
		return err
	}

	req := clientset.CoreV1().RESTClient().Post().
		Resource("pods").
		Name(opts.Pod).
		Namespace(opts.Namespace).
		SubResource("exec").
		VersionedParams(&corev1.PodExecOptions{
			Container: opts.Container,
			Command:   opts.Command,
			Stdin:     opts.Stdin != nil,
			Stdout:    opts.Stdout != nil,
			Stderr:    opts.Stderr != nil,
			TTY:       opts.TTY,
		}, scheme.ParameterCodec)

	executor, err := remotecommand.NewSPDYExecutor(restConfig, "POST", req.URL())
	if err != nil {
		return fmt.Errorf("failed to create executor: %w", err)
	}

	streamOpts := remotecommand.StreamOptions{
		Stdin:             opts.Stdin,
		Stdout:            opts.Stdout,
		Stderr:            opts.Stderr,
		Tty:               opts.TTY,
		TerminalSizeQueue: sizeQueue,
	}

	return executor.StreamWithContext(ctx, streamOpts)
}
