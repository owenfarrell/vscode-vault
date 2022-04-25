# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 2.3

### Added
- Copy command with `ctrl + c` shortcut

### Removed
- Custom icon reosurces
- Vault connection button from non-vault panels

### Changed
- GitHub authentication token validation
- CI/CD pipeline to support pre-release publishing

### Security
- Bump elliptic from 6.5.3 to 6.5.4
- Bump y18n from 4.0.0 to 4.0.1
- Bump ssri from 6.0.1 to 6.0.2
- Bump validator from 13.0.0 to 13.7.0
- Bump hosted-git-info from 2.8.8 to 2.8.9
- Bump path-parse from 1.0.6 to 1.0.7
- Bump jszip from 3.5.0 to 3.7.1
- Bump pathval from 1.1.0 to 1.1.1
- Bump minimist from 1.2.5 to 1.2.6
- Bump ansi-regex from 3.0.0 to 3.0.1

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
