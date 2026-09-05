%global debug_package %{nil}

Name:           celia
Version:        0.1.0
Release:        1%{?dist}
Summary:        Kubernetes troubleshooting and operations tool

License:        MIT
URL:            https://github.com/tonymora/celia
Source0:        %{name}-%{version}.tar.gz

BuildRequires:  golang >= 1.22
BuildRequires:  nodejs >= 20
BuildRequires:  pnpm

Requires:       webkit2gtk4.1
Requires:       gtk3

%description
Celia is a desktop application for Kubernetes troubleshooting and operations,
designed for SREs and platform engineers. It automatically detects common
cluster problems and provides actionable diagnosis.

Features:
- Resource explorer for Pods, Deployments, Services, ConfigMaps, Secrets, Nodes
- Problem detection engine with severity ranking
- Real-time log viewing and filtering
- Pod metrics and resource usage visualization
- Operations: scale, restart, delete, YAML editing
- Audit logging of all operations

%package server
Summary:        Celia server component (headless mode)
Requires:       %{name} = %{version}-%{release}

%description server
The Celia server component allows running Celia in headless mode without the
desktop application. Useful for remote access or integration with other tools.

%prep
%autosetup -n %{name}-%{version}

%build
export GO111MODULE=on
export CGO_ENABLED=0

go build -ldflags "-s -w -X main.version=%{version}" \
    -o celia-server ./cmd/celia-server

cd ui
pnpm install --frozen-lockfile
pnpm build
cd ..

%install
install -Dm755 celia-server %{buildroot}%{_bindir}/celia-server

mkdir -p %{buildroot}%{_datadir}/%{name}/ui
cp -r ui/dist/* %{buildroot}%{_datadir}/%{name}/ui/

install -Dm644 packaging/rpm/celia.desktop %{buildroot}%{_datadir}/applications/celia.desktop

install -Dm644 desktop/src-tauri/icons/128x128.png %{buildroot}%{_datadir}/icons/hicolor/128x128/apps/celia.png
install -Dm644 desktop/src-tauri/icons/32x32.png %{buildroot}%{_datadir}/icons/hicolor/32x32/apps/celia.png

mkdir -p %{buildroot}%{_sysconfdir}/celia
install -Dm644 configs/default.yaml %{buildroot}%{_sysconfdir}/celia/config.yaml

install -Dm644 packaging/rpm/celia.service %{buildroot}%{_unitdir}/celia.service

%post
%systemd_post celia.service

%preun
%systemd_preun celia.service

%postun
%systemd_postun_with_restart celia.service

%files
%license LICENSE
%doc README.md ROADMAP.md
%{_bindir}/celia-server
%{_datadir}/%{name}/
%{_datadir}/applications/celia.desktop
%{_datadir}/icons/hicolor/*/apps/celia.png
%config(noreplace) %{_sysconfdir}/celia/config.yaml

%files server
%{_unitdir}/celia.service

%changelog
* Sat Sep 05 2026 Tony Mora <tonymora@example.com> - 0.1.0-1
- Initial RPM release
- Phase 5 complete: responsive layout, keyboard shortcuts, error boundaries
