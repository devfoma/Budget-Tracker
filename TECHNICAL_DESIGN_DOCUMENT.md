# Technical Design Document (TDD)

## Project Title

Design and Implementation of a Mobile-Based Budget and Expenses Tracking System

## 1. Project Brief

This project is a mobile-based budget and expense tracking application that helps users plan budgets, record income and expenses, monitor spending habits, and view financial reports through simple visual dashboards.

The application targets students, young adults, salary earners, small business owners, and personal finance users who need an accessible way to manage money from a mobile device. The system will focus on ease of use, clear financial feedback, budget discipline, and a modern glassmorphism interface.

The original academic project document describes a Flutter/Dart and local database solution. For this implementation plan, the selected stack is React Native for the mobile frontend and local device storage for offline-first data persistence.

## 2. Problem Statement

Many individuals struggle to manage personal finances because manual tracking methods such as notebooks, spreadsheets, memory-based tracking, and bank statements are inconvenient, error-prone, and do not provide real-time budget feedback.

Existing budgeting applications may be too complex, require constant internet access, include advertisements, lack local relevance, or raise privacy concerns. This project addresses those gaps by providing a simple, secure, mobile-first budgeting system with clear visual reports and timely budget alerts.

## 3. Aim and Objectives

### Aim

To design and implement a mobile-based budget and expenses tracking system using React Native and local storage that enables users to plan budgets, record expenses, monitor spending, and understand financial behavior.

### Objectives

- Provide secure local profile setup, optional app lock, and profile management.
- Allow users to create, edit, and delete budgets.
- Allow users to record income and expense transactions.
- Categorize transactions for clearer spending analysis.
- Display financial summaries through charts, cards, and progress indicators.
- Notify users when they are approaching or exceeding budget limits.
- Support a clean glassmorphism mobile interface.
- Store user data locally on the device using an offline-first storage design.
- Provide a practical architecture that can be developed as a final-year project prototype.

## 4. Proposed Solution

The proposed system is a React Native mobile application that stores financial data locally on the user's device. Users will create a local profile, manage budgets and transactions from the mobile app, and store financial records in a local SQLite database.

The system will include a dashboard showing total income, total expenses, balance, budget progress, recent transactions, and visual spending trends. Users will be able to add transactions manually, assign categories, create budgets for categories or periods, and view reports for weekly, monthly, and custom date ranges.

The interface will use a glassmorphism design style: translucent panels, blurred backgrounds, layered gradients, soft borders, subtle shadows, and readable high-contrast text.

## 5. Target Users

- Students managing allowances and school expenses.
- Salary earners tracking monthly spending.
- Small business owners recording daily cash movement.
- Young adults building budgeting discipline.
- Individuals who want simple financial reports without spreadsheet complexity.

## 6. Scope

### In Scope

- Android-first mobile application.
- Local profile setup and optional app lock.
- User profile and currency settings.
- Budget creation and tracking.
- Income and expense recording.
- Transaction categories.
- Dashboard summaries.
- Reports and charts.
- Budget alerts.
- Basic data export planning.
- Local offline-first data persistence.

## 7. Core Functionalities

### 7.1 Local Profile and App Lock

- Create a local user profile.
- Optionally protect the app with PIN or biometric app lock.
- Unlock and lock the app locally.
- Store user profile details such as full name, preferred currency, and monthly income estimate.
- Keep user data on the device unless a future backup/export feature is added.

### 7.2 Dashboard

- Show current balance.
- Show total income and total expenses for the selected period.
- Show active budget progress.
- Show recent transactions.
- Show spending by category.
- Show warning indicators for budgets near their limits.

### 7.3 Budget Management

- Create a budget by name, amount, period, and optional category.
- Support weekly, monthly, and custom budgets.
- Edit and delete budgets.
- Track spending against budget limits.
- Display progress percentage and remaining amount.
- Trigger alerts at defined thresholds such as 80 percent and 100 percent.

### 7.4 Expense and Income Tracking

- Add income or expense transactions.
- Select category, date, amount, description, and payment method.
- Edit or delete transactions.
- Filter transaction history by date, category, type, or budget.
- View transaction details.

### 7.5 Categories

- Provide default expense categories such as Food, Transport, School, Bills, Health, Shopping, Data, Savings, and Others.
- Provide income categories such as Salary, Allowance, Gift, Business, and Other Income.
- Allow users to create custom categories.
- Assign icons and colors to categories.

### 7.6 Reports and Analytics

- Show weekly and monthly spending trends.
- Show category breakdown charts.
- Show income vs expense comparisons.
- Show budget performance.
- Provide simple insights such as highest spending category and average daily spending.

### 7.7 Alerts and Notifications

- Notify users when a budget reaches warning thresholds.
- Show in-app notifications for exceeded budgets.
- Support reminder notifications for daily or weekly expense entry.
- Store notification history for review.

### 7.8 Settings

- Manage profile.
- Change currency preference.
- Toggle notification preferences.
- Manage categories.
- Export data in a future version.
- Lock app or reset local data.

## 8. Tech Stack

### Mobile Frontend

| Area | Technology | Purpose |
|---|---|---|
| Mobile framework | React Native | Cross-platform mobile application development |
| Development runtime | Expo | Faster development, testing, and device preview |
| Language | TypeScript | Safer data structures and clearer contracts |
| Navigation | React Navigation | Stack and tab navigation |
| State management | Zustand or React Context | Lightweight app state management |
| Forms | React Hook Form | Transaction, budget, and profile forms |
| Validation | Zod | Input validation and typed form rules |
| UI styling | StyleSheet | Consistent styling system |
| Glass UI | Expo BlurView and LinearGradient | Blur, translucent cards, and layered backgrounds |
| Charts | react-native-gifted-charts or Victory Native | Reports and financial visualization |
| Icons | Lucide React Native | Consistent icon system |
| Notifications | Expo Notifications | Budget alerts and reminders |
| Local database | expo-sqlite or react-native-sqlite-storage | Structured offline storage for budgets, transactions, categories, and alerts |
| Key-value storage | MMKV or AsyncStorage | Lightweight preferences, onboarding state, and cached UI settings |
| Secure storage | Expo SecureStore or react-native-keychain | PIN hash, app lock settings, and sensitive local values |
| File storage | Expo FileSystem | Optional receipt images and exported files |

### Local Data Layer

| Area | Technology | Purpose |
|---|---|---|
| Primary storage | SQLite | Relational local database for financial records |
| Preferences | MMKV or AsyncStorage | Fast key-value storage for settings |
| Security | SecureStore, biometric APIs, and device security | Local app lock and sensitive preference protection |
| Data access | Repository/service layer | Centralized read/write operations |
| Reports | Local SQL queries and in-app aggregation | Generate dashboard and chart data from stored records |
| Backup/export | CSV or JSON file export | Optional manual data backup in future versions |

### Development and Documentation

| Area | Technology | Purpose |
|---|---|---|
| Version control | Git and GitHub | Source control |
| Design planning | Markdown | Technical documentation |
| UI design | Figma or AI-assisted screen generation | Wireframes and design mockups |
| Testing | Jest, React Native Testing Library | Unit and component tests |
| Manual testing | Android emulator and physical Android device | Usability and device testing |

## 9. Design Direction: Glassmorphism

The user interface will use glassmorphism to make the finance experience feel modern, calm, and premium without sacrificing readability.

### Visual Principles

- Use translucent surfaces with blur effects.
- Use soft gradient backgrounds with balanced contrast.
- Use thin light borders on glass panels.
- Use subtle shadows to create depth.
- Use rounded cards carefully and consistently.
- Use bright accent colors only for meaning: income, expense, warnings, success, and actions.
- Keep financial data readable before decorative effects.

### Suggested Visual Style

| Token | Recommendation |
|---|---|
| Background | Deep blue, teal, charcoal, or soft financial gradient |
| Primary accent | Cyan, emerald, or electric blue |
| Income color | Green |
| Expense color | Red or coral |
| Warning color | Amber |
| Budget progress | Gradient progress bars |
| Surface | Translucent white or dark glass panels |
| Border | Low-opacity white border |
| Typography | Clean sans-serif with strong number readability |
| Icons | Line icons with consistent stroke width |

### Accessibility Requirements

- Text must remain readable on glass surfaces.
- Important numbers must have high contrast.
- Do not rely on color alone to communicate warnings.
- Touch targets should be at least 44px.
- Forms should have clear labels and validation feedback.

## 10. Screen Inventory and Wireframe Plan

### MVP Screens

| Screen | Purpose | Key Elements |
|---|---|---|
| Splash Screen | Introduce app while checking local profile/app lock state | Logo, app name, gradient/glass background |
| Onboarding Screens | Explain value proposition | 3 slides: track expenses, manage budgets, view reports |
| Create Profile | Create local user profile | Name, optional email, currency, monthly income estimate |
| App Lock Setup | Protect local records | PIN setup, confirm PIN, optional biometric toggle |
| Unlock Screen | Existing user access | PIN entry, biometric unlock, reset local data option |
| Home Dashboard | Main financial overview | Balance, income, expenses, budget progress, recent transactions |
| Add Transaction | Record income or expense | Amount, type, category, date, note, payment method |
| Transaction History | Browse records | Search, filters, transaction list |
| Transaction Details | View or edit one record | Full transaction information and actions |
| Budgets | View all budgets | Budget cards, status, progress, remaining amount |
| Create/Edit Budget | Manage budget rules | Name, category, amount, period, alert threshold |
| Categories | Manage categories | Category grid/list, icons, colors |
| Reports | Analyze finances | Charts, date range, category breakdown |
| Alerts | View warnings and reminders | Budget alerts and notification history |
| Profile and Settings | Manage profile preferences | Profile, currency, notifications, app lock, reset/export data |

### Future Screens

| Screen | Purpose |
|---|---|
| Receipt Upload | Attach receipt image to transaction |
| Export Data | Export transactions by date range |
| Savings Goals | Track target savings |
| Recurring Transactions | Automate repeated expenses or income |

## 11. Design Prompts for Screen Creation

Use the following prompts to generate wireframes or high-fidelity mockups for each screen. The prompts assume a mobile Android layout, React Native implementation, and glassmorphism visual style.

### 11.1 Splash Screen Prompt

Design a mobile splash screen for a budget and expense tracker app. Use a premium glassmorphism style with a deep financial gradient background, soft blurred light shapes, a translucent centered logo panel, app name, and a short loading state. The design should feel modern, trustworthy, and simple. Use strong contrast for text and avoid clutter.

### 11.2 Onboarding Prompt

Design three mobile onboarding screens for a budget and expense tracker. Screen one introduces expense tracking, screen two introduces budget planning, and screen three introduces financial reports and alerts. Use glassmorphism cards over a soft gradient background, clean illustrations or financial icons, short headings, brief supporting text, pagination dots, skip button, and a primary continue/get started button.

### 11.3 Create Profile Prompt

Design a mobile create-profile screen for a personal finance app using glassmorphism. Include full name, optional email, preferred currency selector, monthly income estimate, continue button, and concise privacy note explaining that records are stored locally on the device. Use translucent form panels, clear labels, readable input states, soft gradients, and a secure trustworthy visual tone.

### 11.4 App Lock Setup Prompt

Design a mobile app-lock setup screen for a budget tracking app with glassmorphism styling. Include PIN setup, confirm PIN, biometric unlock toggle, skip option, and continue button. Use a calm gradient background, glass form panel, minimal security iconography, and high-contrast text.

### 11.5 Unlock Screen Prompt

Design a mobile unlock screen for a local-first finance app. Include a PIN keypad, biometric unlock button, app logo, reset local data option, and locked-state feedback. Use glassmorphism styling with a focused, uncluttered layout.

### 11.6 Home Dashboard Prompt

Design the main dashboard screen for a mobile budget and expense tracker. Use glassmorphism with layered translucent cards. Include greeting, current balance, monthly income, monthly expenses, active budget progress, spending category mini chart, quick add transaction button, and recent transactions list. The layout should prioritize quick scanning of financial health.

### 11.7 Add Transaction Prompt

Design a mobile add transaction screen for recording income or expense. Include segmented control for income/expense, large amount input, category selector, date picker, payment method selector, note field, and save button. Use glass panels, clear form hierarchy, icon-based category chips, and meaningful color accents for income and expense.

### 11.8 Transaction History Prompt

Design a mobile transaction history screen for a budget app. Include search input, date range filter, category filter, income/expense filter, and grouped transaction list by date. Each list item should show category icon, description, date, payment method, and amount with income/expense color coding. Use glassmorphism cards and a clean dense layout.

### 11.9 Transaction Details Prompt

Design a mobile transaction details screen with glassmorphism styling. Show amount, transaction type, category, date, payment method, note, budget association, and created date. Include edit and delete actions, with a calm confirmation state for delete. Keep the screen readable and focused.

### 11.10 Budgets Screen Prompt

Design a mobile budgets overview screen for a finance tracker. Include total budgeted amount, total spent, remaining amount, and budget cards for each budget. Each budget card should show category/name, limit, spent amount, remaining amount, progress bar, and status indicator. Use glassmorphism surfaces and clear warning colors for near-limit budgets.

### 11.11 Create/Edit Budget Prompt

Design a mobile create/edit budget screen. Include budget name, amount limit, category selector, period selector, start date, end date, alert threshold slider, and save button. Use a glass form surface, clean input spacing, and preview card showing how the budget progress will appear.

### 11.12 Categories Prompt

Design a mobile category management screen for a budget app. Include tabs for expense and income categories, grid or list of category items, icon, category name, color swatch, edit action, and add category button. Use glassmorphism panels and compact touch-friendly controls.

### 11.13 Reports Prompt

Design a mobile reports and analytics screen for a personal finance app. Include date range selector, income vs expense summary, category spending donut chart, weekly/monthly trend line chart, top spending category, and budget performance insights. Use glassmorphism cards and make charts readable against a gradient background.

### 11.14 Alerts Prompt

Design a mobile alerts screen for budget warnings and reminders. Include unread alert count, budget limit alerts, reminder notifications, read/unread states, and clear-all action. Use amber and red accents carefully, translucent alert cards, and concise notification text.

### 11.15 Profile and Settings Prompt

Design a mobile profile and settings screen for a budget tracking app. Include profile avatar, full name, optional email, currency setting, notification toggle, category management link, export data link, app lock controls, privacy/security section, and reset local data button. Use a calm glassmorphism layout with grouped settings rows.

## 12. Information Architecture

### Navigation Structure

The application will use a combination of app-entry stack navigation and main tab navigation.

| Navigation Area | Screens |
|---|---|
| App Entry Stack | Splash, Onboarding, Create Profile, App Lock |
| Main Tabs | Dashboard, Transactions, Budgets, Reports, Settings |
| Modal/Stack Screens | Add Transaction, Transaction Details, Create/Edit Budget, Categories, Alerts |

### Recommended Bottom Tabs

- Dashboard
- Transactions
- Add
- Budgets
- Reports

Settings can be accessed through the dashboard header or profile icon.

## 13. System Architecture

### High-Level Architecture

The system follows a local-first mobile architecture.

| Layer | Responsibility |
|---|---|
| Mobile UI Layer | Screens, forms, visual components, charts |
| State Layer | Local profile, dashboard data, form state, filters |
| Service Layer | Local database queries, app lock helpers, notification helpers |
| Storage Layer | SQLite, key-value storage, secure storage, file storage |
| Data Layer | Local tables, indexes, migrations, and query views |

### Frontend Module Plan

| Module | Responsibility |
|---|---|
| Profile/App Lock Module | Profile setup, PIN/biometric unlock, local access control |
| Dashboard Module | Financial summary and recent activity |
| Transactions Module | CRUD operations for income and expenses |
| Budgets Module | Budget creation, progress, and alert checks |
| Categories Module | Default and custom category management |
| Reports Module | Chart data, filters, insights |
| Notifications Module | In-app alerts and push reminders |
| Settings Module | Profile, preferences, app lock, export, reset local data |

## 14. Data Structures

### 14.1 Database Tables

#### profiles

Stores the local user profile information for the device.

| Field | Type | Description |
|---|---|---|
| id | text | Primary key for the local profile |
| full_name | text | User's display name |
| email | text | Optional user email address |
| currency | text | Preferred currency, default NGN |
| monthly_income_estimate | numeric | Optional estimated monthly income |
| avatar_url | text | Optional profile image URL |
| created_at | timestamp | Profile creation date |
| updated_at | timestamp | Last profile update |

#### categories

Stores default and user-created categories.

| Field | Type | Description |
|---|---|---|
| id | text | Primary key generated by the app |
| user_id | text | Owner of custom category; null for default local categories |
| name | text | Category name |
| type | text | income or expense |
| icon | text | Icon name |
| color | text | Category display color |
| is_default | boolean | Whether category is system-provided |
| created_at | timestamp | Creation date |

#### budgets

Stores user budget plans.

| Field | Type | Description |
|---|---|---|
| id | text | Primary key generated by the app |
| user_id | text | Local profile owner |
| category_id | text | Optional linked category |
| name | text | Budget name |
| amount_limit | numeric | Maximum planned spending |
| period | text | weekly, monthly, or custom |
| start_date | date | Budget start date |
| end_date | date | Budget end date |
| alert_threshold | numeric | Warning threshold percentage |
| is_active | boolean | Whether budget is active |
| created_at | timestamp | Creation date |
| updated_at | timestamp | Last update |

#### transactions

Stores income and expense entries.

| Field | Type | Description |
|---|---|---|
| id | text | Primary key generated by the app |
| user_id | text | Local profile owner |
| category_id | text | Linked category |
| budget_id | text | Optional linked budget |
| type | text | income or expense |
| amount | numeric | Transaction amount |
| description | text | Short transaction description |
| merchant | text | Optional merchant or source |
| payment_method | text | cash, transfer, card, POS, bank, other |
| transaction_date | timestamp | Date the transaction occurred |
| note | text | Optional additional note |
| receipt_url | text | Optional receipt image URL |
| created_at | timestamp | Creation date |
| updated_at | timestamp | Last update |
| deleted_at | timestamp | Soft delete marker |

#### notifications

Stores in-app alerts and reminders.

| Field | Type | Description |
|---|---|---|
| id | text | Primary key generated by the app |
| user_id | text | Local profile owner |
| type | text | budget_warning, budget_exceeded, reminder, system |
| title | text | Notification title |
| message | text | Notification message |
| related_entity_type | text | budget, transaction, or system |
| related_entity_id | text | Related record id |
| is_read | boolean | Read status |
| scheduled_for | timestamp | Optional scheduled time |
| created_at | timestamp | Creation date |

#### user_settings

Stores user preferences.

| Field | Type | Description |
|---|---|---|
| user_id | text | Primary key and local profile owner |
| currency | text | Preferred currency |
| budget_alerts_enabled | boolean | Enable budget alerts |
| daily_reminders_enabled | boolean | Enable entry reminders |
| reminder_time | time | Preferred reminder time |
| biometric_enabled | boolean | Optional local biometric setting |
| theme_mode | text | system, light, or dark |
| updated_at | timestamp | Last update |

### 14.2 Optional Future Tables

| Table | Purpose |
|---|---|
| savings_goals | Track savings targets |
| recurring_transactions | Define repeated income or expense records |
| exports | Track generated export files |
| audit_logs | Track important changes for accountability |

## 15. Entity Relationships

- One user has one profile.
- One user has many transactions.
- One user has many budgets.
- One user has many custom categories.
- One category has many transactions.
- One budget may be linked to one category.
- One budget may have many transactions.
- One user has many notifications.
- One user has one settings record.

## 16. Data Flow

### 16.1 Local Profile and App Lock Flow

1. User opens the app.
2. App checks whether a local profile exists.
3. If no profile exists, user is sent to onboarding and Create Profile.
4. User creates a local profile and selects preferred currency.
5. User optionally sets up PIN or biometric app lock.
6. App initializes default categories, settings, and local database tables.
7. App loads profile, settings, categories, budgets, and dashboard summary.
8. User enters the main app.

### 16.2 Add Transaction Flow

1. User taps the add transaction action.
2. App opens the Add Transaction screen.
3. User selects income or expense.
4. User enters amount, category, date, payment method, and note.
5. App validates required fields.
6. App saves the transaction to the local SQLite database.
7. App refreshes dashboard totals and transaction list.
8. If the transaction is an expense, app checks related budget usage.
9. If a threshold is reached, app creates an alert.

### 16.3 Budget Creation Flow

1. User opens Create Budget.
2. User enters budget name, limit, category, period, and alert threshold.
3. App validates amount and date rules.
4. Budget is saved to the local SQLite database.
5. App displays the budget in the Budgets screen.
6. Dashboard reflects the active budget status.

### 16.4 Budget Alert Flow

1. User adds or edits an expense transaction.
2. App calculates total expenses linked to the budget period and category.
3. App compares spending against budget amount.
4. If spending reaches the warning threshold, app creates a warning notification.
5. If spending exceeds the budget limit, app creates an exceeded-budget notification.
6. App displays alerts in the Dashboard and Alerts screen.

### 16.5 Reports Flow

1. User opens Reports.
2. App loads transactions for the selected period.
3. App groups data by category, type, and date.
4. App calculates totals, trends, averages, and budget performance.
5. App displays charts and summary cards.

### 16.6 Offline-First Flow

1. App stores all core records directly on the device.
2. Dashboard, transactions, budgets, categories, and reports work without internet.
3. New entries are saved immediately to local SQLite.
4. Optional future backup/export can generate CSV or JSON files.
5. Optional future backup/import would require user confirmation for sensitive changes.

## 17. Local Security Plan

### Local Access Control

- Use a local profile instead of server-based authentication.
- Allow users to enable PIN or biometric app lock.
- Store sensitive app-lock values using SecureStore or a keychain-backed storage library.
- Store only necessary profile data.
- Provide a clear warning before resetting local data.

### Local Data Privacy

Because the MVP stores data locally, privacy depends on device access control, app lock, and careful handling of exported files.

| Table | Security Rule |
|---|---|
| profiles | Store one active local profile for MVP |
| budgets | Store records under the local profile id |
| transactions | Store records under the local profile id |
| notifications | Store records under the local profile id |
| user_settings | Store settings under the local profile id |
| categories | Store default categories and local custom categories |

### Data Protection

- Do not store PIN values as plain text.
- Prefer biometric unlock where available.
- Rely on device-level encryption where supported.
- Warn users that deleting or uninstalling the app may delete local data.
- Make exports user-triggered and clearly labeled.
- Validate inputs before database writes.
- Use soft delete for transactions if auditability is required.

## 18. Business Rules

- Expense amounts must be greater than zero.
- Income amounts must be greater than zero.
- A budget limit must be greater than zero.
- A budget end date must not be earlier than its start date.
- A transaction must belong to the active local profile.
- Expense transactions can affect budget progress.
- Income transactions affect balance but do not reduce budgets.
- Budget alerts should not repeatedly spam the same threshold without a meaningful change.
- Default categories should be available to every user.

## 19. Reporting Calculations

| Metric | Calculation |
|---|---|
| Total income | Sum of income transactions in selected period |
| Total expenses | Sum of expense transactions in selected period |
| Balance | Total income minus total expenses |
| Budget spent | Sum of expense transactions matching budget period and category |
| Budget remaining | Budget limit minus budget spent |
| Budget progress | Budget spent divided by budget limit |
| Top category | Expense category with highest total spending |
| Average daily spend | Total expenses divided by number of days in selected period |

## 20. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | The system shall allow users to create a local profile. |
| FR-02 | The system shall allow users to log in and log out. |
| FR-03 | The system shall allow users to create budgets. |
| FR-04 | The system shall allow users to edit and delete budgets. |
| FR-05 | The system shall allow users to add income transactions. |
| FR-06 | The system shall allow users to add expense transactions. |
| FR-07 | The system shall allow users to view transaction history. |
| FR-08 | The system shall allow users to filter transactions. |
| FR-09 | The system shall calculate budget usage automatically. |
| FR-10 | The system shall notify users when budgets approach or exceed limits. |
| FR-11 | The system shall display reports and charts. |
| FR-12 | The system shall allow users to manage categories. |
| FR-13 | The system shall allow users to update profile settings. |

## 21. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Usability | The app should be simple enough for non-technical users. |
| Performance | Dashboard and transaction lists should load quickly for common data sizes. |
| Security | User records should be protected by local app lock, secure storage, and device-level protection. |
| Reliability | Failed saves should show clear error states. |
| Maintainability | Features should be separated into modules. |
| Scalability | Database structure should support future features such as recurring transactions. |
| Accessibility | Text and controls must remain readable and touch-friendly. |
| Portability | The app should run on Android first, with future iOS support possible. |

## 22. State Management Plan

| State Area | Data Managed |
|---|---|
| Profile/app lock state | Local profile, lock status, onboarding state |
| Profile state | Full name, currency, settings |
| Category state | Default and custom categories |
| Transaction state | List, filters, selected transaction |
| Budget state | Active budgets, budget progress |
| Dashboard state | Summary totals, charts, recent transactions |
| Notification state | Alerts, unread count |

## 23. Validation Plan

### Form Validation

- Email must be valid.
- Password must meet minimum length.
- Amount must be numeric and greater than zero.
- Required fields must be completed before saving.
- Date values must be valid.
- Budget threshold must be within an accepted range.

### Error Handling

- Show clear messages for local storage failures.
- Show validation messages beside form fields.
- Prevent duplicate form submissions.
- Use loading states during local database operations.
- Provide empty states when no data exists.

## 24. Testing Plan

### Unit Tests

- Budget progress calculation.
- Balance calculation.
- Transaction grouping by date.
- Category totals.
- Form validation rules.

### Component Tests

- App lock form validation.
- Add transaction form behavior.
- Budget card progress display.
- Transaction list rendering.
- Empty state rendering.

### Integration Tests

- Sign up and profile creation.
- Add transaction and dashboard refresh.
- Create budget and update budget progress.
- Budget alert creation after expense entry.

### Manual Test Cases

| Test Case | Expected Result |
|---|---|
| User signs up successfully | User enters the dashboard |
| User adds expense | Expense appears in history and dashboard total updates |
| User adds income | Income appears in history and balance updates |
| User creates monthly budget | Budget appears in budget list |
| Expense reaches budget threshold | Warning alert is shown |
| User filters transactions by category | Only matching records appear |
| User locks app | User returns to unlock screen |

## 25. Implementation Phases

### Phase 1: Planning and Setup

- Finalize technical design document.
- Create wireframes and visual mockups.
- Set up React Native project.
- Define local SQLite schema.
- Define local storage, migrations, and seed data.

### Phase 2: Local Profile and App Lock

- Implement profile creation, app lock setup, unlock, and local reset flow.
- Create profile and settings records.
- Add onboarding and profile persistence.

### Phase 3: Core Finance Features

- Implement categories.
- Implement transactions.
- Implement budgets.
- Connect budget calculations to expenses.

### Phase 4: Dashboard and Reports

- Build dashboard summary.
- Add recent transactions.
- Add charts and report filters.
- Add budget status indicators.

### Phase 5: Alerts and Polish

- Add in-app budget alerts.
- Add notification preferences.
- Refine glassmorphism UI.
- Add loading, empty, and error states.

### Phase 6: Testing and Final Documentation

- Test major user flows.
- Fix bugs and usability issues.
- Prepare screenshots.
- Update final project documentation.

## 26. Acceptance Criteria

The project will be considered successful when:

- A user can register, log in, and log out.
- A user can create and manage budgets.
- A user can add, edit, and delete income and expense transactions.
- The dashboard correctly displays balance, income, expense, and recent activity.
- Budget progress updates based on expense entries.
- The app shows alerts when budget thresholds are reached.
- Reports show spending by category and time period.
- User data is protected so one user cannot access another user's records.
- The mobile interface follows the agreed glassmorphism design style.

## 27. Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Glassmorphism reduces readability | Use strong text contrast and restrained blur |
| Local data loss from uninstall/reset | Add clear warnings and future export option |
| Storage migration errors | Version database migrations and test upgrades |
| Scope grows too large | Keep MVP focused on budgets, transactions, reports, and alerts |
| Chart performance issues | Limit chart ranges and aggregate data before rendering |
| User input errors | Use strong validation and helpful form feedback |

## 28. Recommended MVP Priority

The first working prototype should focus on:

1. Local profile and app lock.
2. Dashboard.
3. Add transaction.
4. Transaction history.
5. Budgets.
6. Budget alerts.
7. Reports.
8. Settings.

## 29. Academic Alignment

This implementation supports the original research objectives by providing:

- A mobile-based solution for personal finance management.
- A structured system for budget planning.
- Expense recording and categorization.
- Financial reports and visual feedback.
- Alert mechanisms for budget discipline.
- A clear system design suitable for final-year project documentation.

Although the original project brief mentioned Flutter, this technical plan adapts the solution to React Native while preserving the local-database intent, academic objectives, user needs, and system functionality.
