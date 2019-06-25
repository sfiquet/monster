# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- Srdimport & App: Implement fly speed
- Srdimport: Check for discrepancy between the HP in the Excel file and the calculated value
- Srdimport: output log in CSV format to import into spreadsheet for analysis
- Srdimport: add list of imported monsters at the end of the log file, with a section for warnings

### Changed
- Srdimport: improve calculation of shape

### Fixed
- Feats: Fixed bug where only the last occurrence of a feat with details (e.g. Skill Focus) was taken into account

## 0.2.0 - 2019-06-08
### Added
- Support complex content in Special Abilities (App)
  - multiple paragraphs
  - titled paragraphs
  - lists
  - tables
  - additional title level for formatting curse, disease and poison
- Support specialised skills: Craft, Knowledge, Perform, Profession; including in racial modifiers and with Skill Focus (Srdimport & App)
- Database: use srdimport to import monsters
  - Bestiary 1: import 16 monsters, including the 5 that were previously in the database
  - Bestiary 2: import 8 monsters
  - Bestiary 3: import 5 monsters
  - Bestiary 4: import 3 monsters
- Srdimport: disable importing of monsters with unsupported features
  - subtypes
  - types: aberration, humanoid and outsider
- Srdimport: import monster source and languages
- new Build utility: generate the database from the output of srdimport and manually edited files

### Changed
- Data: modified skill format to support specialised skills
- Data & App: represent DR, Resist and SR as values instead of text
- Srdimport: create a separate JSON file for each monster
- App: improve UI for monster selection UI

### Fixed
- Calculations: implement proper support for monster type class skills
- Templates: implement proper compatibility checks

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
