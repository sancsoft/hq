# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.17] - 2024-07-01

### Fixed
- Vacation calculations

## [0.3.16] - 2024-07-01

### Change
- Sort projects by name on timesheet entry

## [0.3.15] - 2024-06-30

### Added
- Additional debug output to voltron time import

## [0.3.14] - 2024-06-30

### Fixed
- Charge code create form validation
- Timesheet dashboard color consistency
- Angular linter warnings and errors
- Vacation hour calculations

### Added
- Skipped counts to voltron timesheet import response
- Rejected time UI (red button if there is any rejected time for correction)
- Storage service implementation
  - Database
  - Filesystem
- RXJS linting rules
- RXJS angular linting rules
- Arguments to voltron import to support specifying status
- CapturedAt timestamp to time entries
- Endpoint to capture unsubmitted time based on time range
- Endpoint to bulk set time entry cutoff dates on staff
- Weekly time processing subcommand
  - Captures unsubmitted time for previous PSR week
  - Generates PSRs for previous PSR week
  - Update time entry cutoff date on all staff to start of current PSR week

### Changed
- Restrict time creation, modification and delete based on cutoff date
- PSR list will now highlight a row red if the report is unsubmitted or if there are any time entries within the PSR period that are not Accepted or Rejected

## [0.3.13] - 2024-06-28

### Fixed
- Handling charge code creation when creating a quote
- localstorage token renewal when multiple tabs are open

## [0.3.12] - 2024-06-27

### Fixed
- Time entry feedback
  - Red outline on invalid inputs
  - Red chit on invalid time entries
  - Added pill charge code if no project is selected yet
  - Gray text on readonly time entry states
  - Filter to active charge codes only
  - Added reset button (X)
  - Black border on inputs
  - Disable submit button if no pending time
- Consistent error handling on forms
  - Use `markAllAsTouched()` when attempting to submit a form to trigger validation display on invalid fields
  - Consistent handling of 400 response from server
- Disabled unimplemented buttons
- Fixed broken links
- Fixed PSR list selected PSR state on project view
- Fixed PSR tabs on project view
- Fixed project status filter

## [0.3.11] - 2024-06-26

### Changed
- Renamed My Dashboard to Home and moved to front of nav menu

## [0.3.10] - 2024-06-26

### Fixed
- Dashboard date filter bug when clearing date
- Handled rejection/approval back and forth with PSR
- Extra time entry update requests

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

[unreleased]: https://github.com/sancsoft/hq/compare/v0.3.17...HEAD
[0.3.17]: https://github.com/sancsoft/hq/compare/v0.3.16...v0.3.17
[0.3.16]: https://github.com/sancsoft/hq/compare/v0.3.15...v0.3.16
[0.3.15]: https://github.com/sancsoft/hq/compare/v0.3.14...v0.3.15
[0.3.14]: https://github.com/sancsoft/hq/compare/v0.3.13...v0.3.14
[0.3.13]: https://github.com/sancsoft/hq/compare/v0.3.12...v0.3.13
[0.3.12]: https://github.com/sancsoft/hq/compare/v0.3.11...v0.3.12
[0.3.11]: https://github.com/sancsoft/hq/compare/v0.3.10...v0.3.11
[0.3.10]: https://github.com/sancsoft/hq/compare/v0.3.9...v0.3.10
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