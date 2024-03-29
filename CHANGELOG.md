# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0]

### Added

- Progress runner for long-running actions
- Zip utility for packaging functions
- Code lens for yaml function manifests
- Document helper to open json & yaml files
- Output logger

### Changed

- Folder structure to be more like a microservice controller/service style
- Function management to use the new task runner
- Function management to use the new zip utility
- Function management to use the new code lens
- Topics to use the new document helper
- Function to use the new document helper
- All debugging outputs to use the new output logger

Contributors: ddieruf

## [0.4.0]

### Fixed

- Remove topic if created when checking for existing topic

### Added

- Get topic stats
- Get topic properties
- Delete topic

Contributors: ddieruf

## [0.3.2]

### Fixed

- Forgot to update readme, DOH!

Contributors: ddieruf

## [0.3.1]

### Added

- Function management
  - List function status, stats, and info
  - Watch all function topics
  - List function instances
  - Start/stop/restart function (and individual instances)
  - Delete function

Contributors: ddieruf

## [0.2.3]

### Fixed

- WSL path splitting (no, really it's linux... but not)

Contributors: ddieruf

## [0.2.2]

### Fixed

- Path splitting needs to look at process.platform

Contributors: ddieruf

## [0.2.1]

### Added

- The new features to the readme

Contributors: ddieruf

## [0.2.0]

### Fixed

- Websocket connection issues
- Topic message editor lifecycle
- Refresh cluster tree when Astra cluster is created

### Added

- Schema lookup on topic
- Watch multiple topics in different tabs

### Removed

- Websocket reader class (it was making things more complicated than they needed to be)

Contributors: ddieruf

## [0.1.0]

### Fixed

- Refresh cluster tree when changes are made
- Dependency management in webbuild

### Added

- Enabled the extension to be installed from the marketplace
- Topic creation wizard

Contributors: ddieruf

## [0.1.0-alpha.1]

### Fixed

- Refresh cluster tree when changes are made

### Added

- Pulsar websocket reader
- Topic message editor provider
- Custom editor and language definition for .pulsar files
- Added websocket option to cluster onboarding wizard

### Changed

- Rearranged folder structure to be more object oriented and less vscode related
- Trying to reduce the number of vscode references to make classes and types more testable

Contributors: ddieruf

## [0.1.0-alpha.0]

### Added

- Everything

Contributors: ddieruf
