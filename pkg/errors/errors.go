package errors

import (
	"errors"
	"fmt"
)

var (
	ErrNotFound          = errors.New("resource not found")
	ErrAlreadyExists     = errors.New("resource already exists")
	ErrInvalidInput      = errors.New("invalid input")
	ErrUnauthorized      = errors.New("unauthorized")
	ErrForbidden         = errors.New("forbidden")
	ErrConnectionFailed  = errors.New("connection failed")
	ErrTimeout           = errors.New("operation timed out")
	ErrInternal          = errors.New("internal error")
	ErrNotConnected      = errors.New("not connected to cluster")
	ErrUnsupportedKind   = errors.New("unsupported resource kind")
	ErrValidationFailed  = errors.New("validation failed")
	ErrOperationFailed   = errors.New("operation failed")
	ErrMetricsUnavailable = errors.New("metrics not available")
)

type DomainError struct {
	Code    ErrorCode
	Message string
	Cause   error
	Details map[string]interface{}
}

func (e *DomainError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("%s: %s: %v", e.Code, e.Message, e.Cause)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func (e *DomainError) Unwrap() error {
	return e.Cause
}

func (e *DomainError) Is(target error) bool {
	if t, ok := target.(*DomainError); ok {
		return e.Code == t.Code
	}
	return errors.Is(e.Cause, target)
}

func New(code ErrorCode, message string) *DomainError {
	return &DomainError{
		Code:    code,
		Message: message,
		Details: make(map[string]interface{}),
	}
}

func Wrap(code ErrorCode, message string, cause error) *DomainError {
	return &DomainError{
		Code:    code,
		Message: message,
		Cause:   cause,
		Details: make(map[string]interface{}),
	}
}

func (e *DomainError) WithDetail(key string, value interface{}) *DomainError {
	e.Details[key] = value
	return e
}

func NotFound(resourceType, name string) *DomainError {
	return New(CodeNotFound, fmt.Sprintf("%s '%s' not found", resourceType, name)).
		WithDetail("resource_type", resourceType).
		WithDetail("name", name)
}

func InvalidInput(message string) *DomainError {
	return New(CodeInvalidInput, message)
}

func ConnectionFailed(target string, cause error) *DomainError {
	return Wrap(CodeConnectionFailed, fmt.Sprintf("failed to connect to %s", target), cause)
}

func Internal(message string, cause error) *DomainError {
	return Wrap(CodeInternal, message, cause)
}

func OperationFailed(operation string, cause error) *DomainError {
	return Wrap(CodeOperationFailed, fmt.Sprintf("operation '%s' failed", operation), cause)
}

func IsNotFound(err error) bool {
	var domainErr *DomainError
	if errors.As(err, &domainErr) {
		return domainErr.Code == CodeNotFound
	}
	return errors.Is(err, ErrNotFound)
}

func IsConnectionFailed(err error) bool {
	var domainErr *DomainError
	if errors.As(err, &domainErr) {
		return domainErr.Code == CodeConnectionFailed
	}
	return errors.Is(err, ErrConnectionFailed)
}
