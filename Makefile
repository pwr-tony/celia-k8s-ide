.PHONY: all build run test lint clean dev deps

BINARY_NAME=celia-server
BUILD_DIR=./build
CMD_DIR=./cmd/celia-server
GO=go

LDFLAGS=-ldflags "-s -w"

all: build

deps:
	$(GO) mod download
	$(GO) mod tidy

build: deps
	@mkdir -p $(BUILD_DIR)
	$(GO) build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) $(CMD_DIR)

run: build
	$(BUILD_DIR)/$(BINARY_NAME)

dev:
	@which air > /dev/null || go install github.com/air-verse/air@latest
	air

test:
	$(GO) test -v -race -cover ./...

test-coverage:
	$(GO) test -v -race -coverprofile=coverage.out ./...
	$(GO) tool cover -html=coverage.out -o coverage.html

lint:
	@which golangci-lint > /dev/null || go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	golangci-lint run ./...

fmt:
	$(GO) fmt ./...
	goimports -w .

clean:
	rm -rf $(BUILD_DIR)
	rm -f coverage.out coverage.html

mocks:
	@which mockgen > /dev/null || go install go.uber.org/mock/mockgen@latest
	$(GO) generate ./...

verify:
	$(GO) mod verify

update:
	$(GO) get -u ./...
	$(GO) mod tidy

help:
	@echo "Available targets:"
	@echo "  all           - Build the application (default)"
	@echo "  build         - Build the application"
	@echo "  run           - Build and run the application"
	@echo "  dev           - Run with hot reload (requires air)"
	@echo "  test          - Run tests"
	@echo "  test-coverage - Run tests with coverage report"
	@echo "  lint          - Run linter"
	@echo "  fmt           - Format code"
	@echo "  clean         - Clean build artifacts"
	@echo "  deps          - Download dependencies"
	@echo "  mocks         - Generate mocks"
	@echo "  verify        - Verify dependencies"
	@echo "  update        - Update dependencies"
