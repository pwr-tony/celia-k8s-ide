.PHONY: all build run test lint clean dev deps desktop-sidecar-linux desktop-sidecar-darwin desktop-sidecar-windows desktop-dev desktop-build

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

desktop-sidecar-linux:
	GOOS=linux GOARCH=amd64 $(GO) build $(LDFLAGS) \
		-o desktop/src-tauri/binaries/celia-server-x86_64-unknown-linux-gnu \
		$(CMD_DIR)

desktop-sidecar-darwin:
	GOOS=darwin GOARCH=amd64 $(GO) build $(LDFLAGS) \
		-o desktop/src-tauri/binaries/celia-server-x86_64-apple-darwin \
		$(CMD_DIR)
	GOOS=darwin GOARCH=arm64 $(GO) build $(LDFLAGS) \
		-o desktop/src-tauri/binaries/celia-server-aarch64-apple-darwin \
		$(CMD_DIR)

desktop-sidecar-windows:
	GOOS=windows GOARCH=amd64 $(GO) build $(LDFLAGS) \
		-o desktop/src-tauri/binaries/celia-server-x86_64-pc-windows-msvc.exe \
		$(CMD_DIR)

desktop-dev: desktop-sidecar-linux
	cd ui && pnpm dev &
	cd desktop/src-tauri && cargo tauri dev

desktop-build: desktop-sidecar-linux
	cd ui && pnpm build
	cd desktop/src-tauri && cargo tauri build

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
	@echo ""
	@echo "Desktop (Tauri) targets:"
	@echo "  desktop-sidecar-linux   - Build Go sidecar for Linux"
	@echo "  desktop-sidecar-darwin  - Build Go sidecar for macOS"
	@echo "  desktop-sidecar-windows - Build Go sidecar for Windows"
	@echo "  desktop-dev             - Run Tauri in development mode"
	@echo "  desktop-build           - Build Tauri application for production"
