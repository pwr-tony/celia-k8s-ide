#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VERSION="${VERSION:-0.1.0}"
RELEASE="${RELEASE:-1}"

echo "Building Celia RPM v${VERSION}-${RELEASE}"
echo "Project root: ${PROJECT_ROOT}"

RPM_BUILD_ROOT="${HOME}/rpmbuild"
mkdir -p "${RPM_BUILD_ROOT}"/{BUILD,RPMS,SOURCES,SPECS,SRPMS}

echo "Creating source tarball..."
TARBALL_NAME="celia-${VERSION}"
TARBALL_DIR=$(mktemp -d)
mkdir -p "${TARBALL_DIR}/${TARBALL_NAME}"

rsync -a --exclude='.git' --exclude='node_modules' --exclude='target' \
    --exclude='build' --exclude='tmp' --exclude='coverage*' \
    "${PROJECT_ROOT}/" "${TARBALL_DIR}/${TARBALL_NAME}/"

tar -czf "${RPM_BUILD_ROOT}/SOURCES/${TARBALL_NAME}.tar.gz" \
    -C "${TARBALL_DIR}" "${TARBALL_NAME}"
rm -rf "${TARBALL_DIR}"

echo "Copying spec file..."
cp "${SCRIPT_DIR}/celia.spec" "${RPM_BUILD_ROOT}/SPECS/"

echo "Building RPM..."
rpmbuild -ba \
    --define "version ${VERSION}" \
    --define "release ${RELEASE}%{?dist}" \
    "${RPM_BUILD_ROOT}/SPECS/celia.spec"

echo ""
echo "Build complete!"
echo "RPMs available at:"
find "${RPM_BUILD_ROOT}/RPMS" -name "*.rpm" -type f

echo ""
echo "Source RPM available at:"
find "${RPM_BUILD_ROOT}/SRPMS" -name "*.rpm" -type f
