# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.9] - 2024-06-26

### Fixed
- Missing `AutoLoginPartialRoutesGuard` guard and page title on dashboard route

## [0.3.8] - 2024-06-26

### Added
- Time entry dashboard

## [0.3.7] - 2024-06-25

### Added
- Unit tests for AddPeriod extension method

### Fixed
- Project search filtering and progress bar

## [0.3.6] - 2024-06-21

### Fixed
- Client project status filtering
- Admin time UI
  - Filter
  - Export

## [0.3.5] - 2024-06-20

### Fixed
- CLI null reference exception if notes are empty
- Newlines in CLI output messages
- Client feedback

### Added
- StaffId to CLI state object for querying time
- Labels to all form inputs, search fields
- `AcceptedBy` staff to time entries to track who accepted the time entry
- Authorization checks to Angular project
  - Staff can view mostly everything and executive/admin users can create/edit everything
- No records found on client table lists

- Code formatting CI checks
  - Angular linter
  - .NET format

### Fixed
- Warnings and lint errors

## [0.3.4] - 2024-06-17

### Fixed
- CSV text wrapping in CLI output helper
- CLI API error handling consistency

### Added
- `DateOnlyExtensions` extension methods for calculating time periods based on a given input date
  - Year
  - Quarter
  - Month
  - Week
- Activities/task handling on PSR time list
  - Projects with activities assigned show a dropdown of available activities
  - Projects without activities show a freeform text field
- Time entry API
  - Create/edit
  - List
  - Delete
- CLI time entry
  - Create/edit
  - List
  - Delete

## [0.3.3] - 2024-06-11

### Added
- Toast service
  - Toast notifications to PSR time list after API calls

### Fixed
- Client edit button alignment

### Changed
- PSR week generation to Saturday to Friday

## [0.3.2] - 2024-06-11

### Changed
- PSR updates
  - Added summary total hours, fields for sorting based on project status
  - Cleaned up columns on PSR list
  - Progress bar and % calculation is now dynamic based on project status
  - Swapped red color from progress bar and PSRs that need submitted
  - Highlight unsubmitted PSRs red
  - Only generate PSRs for projects that are Ongoing or InProduction

## [0.3.1] - 2024-06-10

### Added
- Modal service with custom alert, confirm and prompt modals

### Removed
- Filter to only show latest or late PSRs on PSR list

### Changed
- Unified Quote and Project status enums
- PSR details feedback
  - Removed 'Deselect All' button
  - If not time is available to be 'Accepted' the 'Accept' & 'Accept All' buttons should be in a disabled state with a grayed out theme
  - Date is unwrapped
  - Rejected time entry can be edited by changing it back to pending
  - PM Report - if report has been submitted, 'Submit' button is in a disabled state until an edit is made

## [0.3.0] - 2024-06-09

### Fixed
- Page titles on staff routes
- Client modal pagination size too large

### Changed
- Preserve filters, page size and current page when navigating away from PSR list into PSR time and report view

### Added
- "No matching records found" when no results are returned from API
- Saving indicator to PSR report when saving markdown to API
- WIP project management
- WIP charge code management

## [0.2.1] - 2024-06-05

### Added
- `DB_SSL_MODE` parameter to API database configuration
- User import API endpoint
- Angular role auth guards

## [0.2.0] - 2024-06-03

### Added
- Markdown preview to PM report editor

## [0.1.1] - 2024-06-02

### Removed
- Snackbar prototype display when modifying charge code, activity/task and description on PSR time review page.

## [0.1.0] - 2024-06-02

### Added
- Initial release.

[unreleased]: https://github.com/sancsoft/hq/compare/v0.3.9...HEAD
[0.3.9]: https://github.com/sancsoft/hq/compare/v0.3.8...v0.3.9
[0.3.8]: https://github.com/sancsoft/hq/compare/v0.3.7...v0.3.8
[0.3.7]: https://github.com/sancsoft/hq/compare/v0.3.6...v0.3.7
[0.3.6]: https://github.com/sancsoft/hq/compare/v0.3.5...v0.3.6
[0.3.5]: https://github.com/sancsoft/hq/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/sancsoft/hq/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/sancsoft/hq/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/sancsoft/hq/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/sancsoft/hq/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/sancsoft/hq/releases/tag/v0.3.0
[0.2.1]: https://github.com/sancsoft/hq/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/sancsoft/hq/releases/tag/v0.2.0
[0.1.1]: https://github.com/sancsoft/hq/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/sancsoft/hq/releases/tag/v0.1.0