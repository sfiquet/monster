# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
### Added
- Srdimport: disable importing of monsters with unsupported features
  - subtypes
  - types: aberration, humanoid and outsider

### Fixed
- Calculations: implement proper support for monster type class skills

### Security
- Update dependencies

## 0.1.0 - 2019-04-16
### Added
- Srdimport: new utility to import data from the Excel file obtained from [d20pfsrd.com](http://www.d20pfsrd.com/bestiary/tools/monster-filter/)
- Web app: New pages Open Game License and About
- Repo: new files CHANGELOG.md and README.md

### Changed
- Reorganise repo into folders:
  - app
  - data
  - srdimport
- Linting: Replace jshint with eslint

### Fixed
- Use HTTPS link to Google Fonts to avoid mixed content error on HTTPS
- Fix obsolete Chai syntax in tests

### Security
- Update all dependencies

## 0.0.1 - 2016-06-05
### Added
- Express server with thin client
- Monster basic calculations including
  - XP
  - init
  - saves: Fort, Reflex, Will
  - hit points
  - ability modifiers
  - CMB, including maneuver-specific CMB
  - CMD, including maneuver-specific CMD
  - AC, including touch AC and flat-footed AC
  - Melee attack for single natural weapon
    - attack bonus
    - damage bonus
  - skills:
    - untrained skill bonus
    - class skill bonus
    - skill bonus for Climb and Swim speed
    - Stealth size modifier
    - Skill Focus feat
  - special attacks: damage and DC
  - special abilities: DC
- Templates
  - Advanced
  - Giant
  - Young
