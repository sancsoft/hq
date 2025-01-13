# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Max hour time limit to projects
  - Configurable on project edit page
- Logging and metrics support with OpenTelemetry
- Points reminder email
  - Sends Monday at 12PM EST
- Plan reminder email
  - Sends daily at 10AM EST
- Link to project on PSR list and PSR detail page
- Automatically add vacation planning points based on time entries
  - Generates Friday at 8AM EST for the following week
- Filtering staff by jurisdiction on staff list
- Staff name to points modal on points page
- Show current only filter to project list
- Send staff notification if a PM or admin modifies their points
- Send weekly staff hour summary email Monday at 12:15PM EST
- Database indexes to improve performance
- Updated holiday time entry to be re-entrant and called when a new holiday is added after they are generated

### Fixed

- User list not filtering
- File download bug (Quotes, Exports, etc.)
- Fixed PSR list autocomplete z-index bug
- Client name sorting on project list
- PSR header not updating after changing/ editing time
- PM Can't adjust charge code or activity/task on resubmitted time on PSR time table 
- Hide edit icon on points page if user does not have permission
- Updated logic for calculating PSRs to generate for closed projects with time for the previous week

### Changed

- Sort project managers by name in project crud dropdown
- Added staff management under admin dropdown
- Allow PMs to edit project rosters
- Charge code list refactor
- Holiday list refactor
- Staff list refactor
- Time list refactor
- PSR list refactor
- Allow admin to change client on project
- Gray PSR row on PSR list if current period
- Update status options with list from MJT
  - In The Office
  - At Customer
  - WFH
  - WFH AM
  - WFH PM
  - Vacation
  - Sick
  - Holiday
- Time admin updates
  - Add billable filter to list
  - Approved by in list can be removed
  - Change filters to autocomplete, update format of projects to use expanded charge code (QXXX: Client: Project)
  - Add the ability to create time entries
  - Add the ability to change date on edit page
  - Add the ability to delete a time entry for admins only
- Optimized dashboard response time by removing unused fields

## [0.4.16] - 2024-11-04

### Fixed

- Staff create routing

## [0.4.15] - 2024-08-19

### Added

- Ability to edit planning points from points UI
- Additional statuses
  - Working from home morning
  - Working from home afternoon

### Fixed

- Email logo issue
- Client name on project detail

### Changed

- Show toast notification after submitting PSR instead of second confirm
- Show all chage codes on PSR time entries
- Planning points display
  - Charge code prefix: Client Name: Project Name

## [0.4.14] - 2024-08-19

### Fixed

- PSR auto submit not working

## [0.4.13] - 2024-08-12

### Fixed

- Planning points usability updates

## [0.4.12] - 2024-08-11

### Fixed

- Link to staff details on planning points UI

## [0.4.11] - 2024-08-11

### Fixed

- Planning point sorting due to regression from auto-sorting holiday/vacation/sick time at the end

## [0.4.10] - 2024-08-11

### Changed

- Renamed `Timesheets` back to `Staff`
- Renamed `Timesheet` on `Staff` list to `View`
- Added `Time` back to main nav
- Removed admin ability to manage other staff members time
- Allow PMs to modify points for other staff members

## [0.4.9] - 2024-08-09

### Fixed

- Restrict project edit, roster management, and activity management to admin users
- Reload HQ if authentication callback fails

### Change

- Header cleanup
  - Responsive for tablet screen size
  - Added dropdown menu

## [0.4.8] - 2024-08-08

### Fixed

- Time export

## [0.4.7] - 2024-08-08

### Changed

- Sick, Holiday and Vacation planning points are sorted at the end of points when saving to server
- Split PSR auto submit for 0 booking hour projects into a separate process to run for the previous week Monday at noon
- Mark quotes and projects associated with inactive charge code as "Completed"
- Ignore unsubmitted time for current week PSRs when calculating metrics

### Fixed

- Adjusted `tabindex` on date input on timesheet to prevent Chrome from tabbing through date components when tabbing from hours input
- Only show charge code change prompt on PSR if charge code actually changes
- Setting and getting status date timezone handling
- Prevent autocomplete from going off screen

## [0.4.6] - 2024-08-08

### Fixed

- Missing delete and clear icons in timesheet
- Timezone handling when getting todays date when getting/updating status
- PSR list no longer highlights current week PSRs red
- PSR submit button is disabled for current week PSRs

### Changed

- Hide drodpown arrow on select list if readonly
- Autocomplete border color from white to black
- Order projects staff is a member of at the top of the charge code list, non-member projects are grey but still selectable
- Condensed planning point summary page to fit more info, truncate long project names, switched to single line

## [0.4.5] - 2024-08-08

### Added

- Planning points summary page

## [0.4.4] - 2024-08-07

### Changed

- Updated time export to split activity and task
  - If activities are added to projects after the fact, the previously entered tasks are still in the database but inaccessible in the UI, this allows it to be available for export

### Fixed

- When unsubmitted a time entry from PSR, set status to back to Submitted
- Filter points to active charge codes only
- Conditionally make activity required on timesheet for projects that have them defined
- Prevent submitting time without activities when it is required

### Added

- Activity management to projects
- Roster management to projects
- Timesheets section
  - A readonly view of any staff's timesheet, plan markdown and points is available from timesheets page
- Automatically create points based on defined holidays
  - 2 points are added working up from the bottom, if a point is already assigned it does not overwrite it

## [0.4.3] - 2024-08-05

### Changed

- Exclude unsubmitted time from PSR time list
- Added label to date input component
- Added ability to specify which values are returned from `enumToArray`
- Project create/edit updates
  - Simplified and added missing fields to project create/edit forms

## [0.3.27] - 2024-08-05

### Changed

- Bump MimeKit version

## [0.3.26] - 2024-08-05

### Changed

- Allow 0 hours when changing PSR time

## [0.4.2] - 2024-08-02

### Fixed

- Timesheet page height/scrolling

### Changed

- Insert previous icon on plan and PSR reports
- Default markdown preview to collapsed on PSR detail
- Integrated autocomplete on PSR time list
- Set width on charge code column in point UI
- Filter charge codes on PSR time to only active

## [0.4.1] - 2024-08-02

### Changed

- Updated default log level for Microsoft.AspnetCore source to Information
- Voltron chargecode import sets project type based on charge code prefix
- Creating a project now always creates a charge code
  - The charge code type is based on the project type (General, Ongoing, Quote, Service)
- "No matching records found" table element now uses darker background
- Hide Invoices and Services from client details and main navigation until fully implemented

### Added

- ProjectType enumeration
- CSV helper classmap to time export
  - Reordered columns to more closely match legacy timesheet format
- QuoteNumber can now be entered on quote create/edit forms
  - If it exists already, it will error
  - If it does not exist, it will be set
  - If not defined, the quote number will be calculated as the next quote number based on the max quote number in the database
- Reusable table component
  - While waiting for response from API, the table will pulse to indicate it is loading
  - Reusable footer, styling, loading indicator and sort handling
- CoreModule that automatically imports/exports all the reusable components (inputs, tables, etc.)
- File upload input component
- PDF upload to quote create/edit
- PDF download to quote list
- `formControlChange` helper function for better reactive form handling
- `enumToArray` helper function to generate list of enum values for populating dropdowns

## [0.4.0] - 2024-08-02

### Changed

- Quote feedback
  - New quote should default status to draft
  - New quote should default date to today
  - New quote form restricts value to number type
  - Made Quote columns sortable
  - Edit functionality
  - Allow entering quote number (auto generates if blank)
- Project feedback
  - Disable quote selection until a client is selected
  - Automatically set project name to quote name after selection
  - Set rate to clients default rate
  - Preserve selected PSR when switching tabs on project details
- Client list uses new UI components
- Client create/edit uses new UI components
- Use accepted hours when calculating progress on projects and PSR lists
  - If not accepted yet, uses entered hours
- Allow PM to enter 0 hours on PSR time list
- Updated PSR view to use a split view showing both report and time on the same screen
- PSRs are now generated for the current week
  - PSRs for the current week can not be submitted until the following week
- PSR list updates
  - Removed Hrs Total and Hrs Available
  - Renamed Hrs This to Hrs
  - Added period filter (Default to LastWeek)

### Added

- Consitent validation on forms when creating/editing entities
- Toast notification when PSR report is updated
- HQ Table styling to rendered Markdown
- Staff name to rejected time entry email notification
- Link styling to Markdown styles
- Status filter to time list
- Rejection notes icon on resubmitted time entries
- Reject button to resubmitted times in PSR time list
- Reusable UI components
  - Button
  - Search input
  - Progress bar
  - Date input
  - Text/date/number input
  - Panel
  - Form label
  - Tabs
  - Select
  - Textarea
- Word wrapping on PSR PM report editor
- Automatically generate holiday time entries based on defined holidays
- "Show Current Only" filter to staff list, default to checked
- Horizontal panel UI component
- Plan markdown editor with preview to timesheet
- Reminder email to staff with any rejected time entries that need resubmitted
- Autocomplete UI component
- Planning points UI to timesheet

### Fixed

- Missing `ProjectManagerId` on get PSR response
- Reminder emails filter to only active staff
- Bug when clearing data on PSR list
- Table column widths for consistent size when paginating

## [0.3.25] - 2024-07-09

### Fixed

- Missing `ProjectManagerId` on get PSR response

## [0.3.24] - 2024-07-08

### Fixed

- PSR time accept status handling

## [0.3.23] - 2024-07-07

### Fixed

- Staff role PSR view table layout bug

### Added

- Email notifications
  - Added Rejected email notification when PSR time entry is rejected
  - Added Resubmitted email notification when time entry is resubmitted
  - Added time entry reminder email notification that sends an email to any staff who have 0 entries in HQ Friday @ 8AM
  - Added time submission reminder email notification that sends an email to any staff who have 0 entries or any unsubmitted entries in HQ Monday @ 8AM

## [0.3.21] - 2024-07-05

### Added

- `ForwardedHeadersOptions` section to configuration so forward headers from Nginx are handled properly
- `AllowedOrigins` section to configuration to configure CORS

## [0.3.20] - 2024-07-04

### Fixed

- Sort staff dropdown by name on time list
- Voltron charge code import not setting project status
- Filter used vacation hours to current year

### Added

- Hangfire with weekly time processing recurring jobs
- Duplicate time entry button
- Ability to change dates on time entries
- Holiday admin
- Email template and email services
- `This Year` to period dropdown on time list

### Changed

- When importing voltron time as `Accepted` status, automatically set approved hours

## [0.3.19] - 2024-07-03

### Fixed

- Hours input on timesheet missing `min` attribute allowing negative values
- Admin time edit authorization check
- Staff access to time list
- Green color on timesheet

### Added

- "Insert Previous Report" to PSR report tab
  - If a previous PSR exists, clicking this button will insert the last PSR markdown at the current cursor position
- "Create User" checkbox when adding staff to automatically create user
- Accessibility improvements to dashboard (added hover text)
- Hour total statistics to time list

## [0.3.18] - 2024-07-02

### Changed

- Refactored time entry component to use explicit blur events to trigger event emitter to prevent duplicate requests and conflicts with observable streams based on valueChanges
- Made toast styling a little more apparent
- After creating a new time entry, the new time row hours is automatically focused

### Added

- `To PSR date` to `hrs total` summary underneath progress bar on PSR list page to indicate the total is for the PSR week, not now
- `Microsoft.AspNetCore.DataProtection.EntityFrameworkCore` for data protection key persistence to Entity Framework context
- `min` validator to hours on time entry
- Display rejection notes in modal when clicking the icon

### Fixed

- Red validation borders on time entry are now displayed when form is touched
- Ignore `HostAbortedException` exception when host is stopping
- Bug when resetting time the date is cleared
- Extra whitespace in confirm modal when rejecting a time entry from PSR time list

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

[unreleased]: https://github.com/sancsoft/hq/compare/v0.4.16...HEAD
[0.4.16]: https://github.com/sancsoft/hq/compare/v0.4.10...v0.4.16
[0.4.15]: https://github.com/sancsoft/hq/compare/v0.4.10...v0.4.15
[0.4.14]: https://github.com/sancsoft/hq/compare/v0.4.10...v0.4.14
[0.4.13]: https://github.com/sancsoft/hq/compare/v0.4.10...v0.4.13
[0.4.12]: https://github.com/sancsoft/hq/compare/v0.4.10...v0.4.12
[0.4.11]: https://github.com/sancsoft/hq/compare/v0.4.10...v0.4.11
[0.4.10]: https://github.com/sancsoft/hq/compare/v0.4.9...v0.4.10
[0.4.9]: https://github.com/sancsoft/hq/compare/v0.4.8...v0.4.9
[0.4.8]: https://github.com/sancsoft/hq/compare/v0.4.7...v0.4.8
[0.4.7]: https://github.com/sancsoft/hq/compare/v0.4.6...v0.4.7
[0.4.6]: https://github.com/sancsoft/hq/compare/v0.4.5...v0.4.6
[0.4.5]: https://github.com/sancsoft/hq/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/sancsoft/hq/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/sancsoft/hq/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/sancsoft/hq/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/sancsoft/hq/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/sancsoft/hq/releases/tag/v0.4.0
[0.3.27]: https://github.com/sancsoft/hq/compare/v0.3.26...v0.3.27
[0.3.26]: https://github.com/sancsoft/hq/compare/v0.3.25...v0.3.26
[0.3.25]: https://github.com/sancsoft/hq/compare/v0.3.24...v0.3.25
[0.3.24]: https://github.com/sancsoft/hq/compare/v0.3.23...v0.3.24
[0.3.23]: https://github.com/sancsoft/hq/compare/v0.3.21...v0.3.23
[0.3.21]: https://github.com/sancsoft/hq/compare/v0.3.20...v0.3.21
[0.3.20]: https://github.com/sancsoft/hq/compare/v0.3.19...v0.3.20
[0.3.19]: https://github.com/sancsoft/hq/compare/v0.3.18...v0.3.19
[0.3.18]: https://github.com/sancsoft/hq/compare/v0.3.17...v0.3.18
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
