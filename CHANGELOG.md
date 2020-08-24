# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 2.2.2

### Changed
- Run GitHub code analysis as part of CI process
- Command function parameter to match context menu condition
- Upgrade vsce to latest version

### Security
- Remove vulnerable dependencies

## 2.2.1

### Added
- Add server element to TreeView on login failure

## 2.2.0

### Added
- Add command to disconnect an existing Vault connection
- Add command to reconnect an existing Vault connection
- Add command to remove an existing Vault connection
- Load saved sessions from globalState on extension activation
- Save session configurations to globalState on connection/removal
- Add LDAP login support
- Add test suite to validate user interface interactions

### Removed
- Engine prompt when browsing a path to an existing mount point

## 2.1.1

### Added
- Command order in view item menu
- CI/CD processes

## 2.1.0

### Added
- Replace clipboardy with VSCode provided implementation

### Fixed
- Prevent clipboard race condition

### Security
Upgrade node-vault to 0.9.16

## 2.0.1

- Replace support for configuring trusted authorities (#18)

## 2.0.0

### Added
- TreeView UI
- Support for interacting with KV2

### Changed
- Migrated CI/CD and publishing to GitHub Actions

## 1.1.0

### Removed
- Remove validation for Native Tokens (#9)

### Security
- Upgrade node-vault to v0.9.12 (#14)

## 1.0.0

Initial release

### Added
- Support for authenticating via a native Vault client
- Support for authenticating via a GitHub backend
- Support for authenticating via a Username & Password backend
- Support for authenticating manually via an existing token
- Ability to write JSON payloads to Vault paths
- Ability to write key/value pairs to Vault paths
- Ability to copy individual attribute values from existing Vault paths
- Auto-copy integration for paths with a single attribute
- Auto-clearing clipboard after 1 minute (or on window closure)
