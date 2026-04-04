package errors

type ErrorCode string

const (
	CodeNotFound         ErrorCode = "NOT_FOUND"
	CodeAlreadyExists    ErrorCode = "ALREADY_EXISTS"
	CodeInvalidInput     ErrorCode = "INVALID_INPUT"
	CodeUnauthorized     ErrorCode = "UNAUTHORIZED"
	CodeForbidden        ErrorCode = "FORBIDDEN"
	CodeValidationFailed ErrorCode = "VALIDATION_FAILED"
	CodeUnsupportedKind  ErrorCode = "UNSUPPORTED_KIND"

	CodeInternal          ErrorCode = "INTERNAL_ERROR"
	CodeConnectionFailed  ErrorCode = "CONNECTION_FAILED"
	CodeTimeout           ErrorCode = "TIMEOUT"
	CodeOperationFailed   ErrorCode = "OPERATION_FAILED"
	CodeMetricsUnavailable ErrorCode = "METRICS_UNAVAILABLE"
	CodeNotConnected      ErrorCode = "NOT_CONNECTED"
)

func (c ErrorCode) HTTPStatus() int {
	switch c {
	case CodeNotFound:
		return 404
	case CodeAlreadyExists:
		return 409
	case CodeInvalidInput, CodeValidationFailed, CodeUnsupportedKind:
		return 400
	case CodeUnauthorized:
		return 401
	case CodeForbidden:
		return 403
	case CodeTimeout:
		return 504
	case CodeNotConnected:
		return 503
	case CodeInternal, CodeConnectionFailed, CodeOperationFailed, CodeMetricsUnavailable:
		return 500
	default:
		return 500
	}
}

func (c ErrorCode) String() string {
	return string(c)
}
