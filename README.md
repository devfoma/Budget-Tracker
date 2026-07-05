# Budget Tracker

A mobile budget and expense tracker built with Expo and React Native. The app helps users record income and expenses, monitor active budgets, review spending trends, and keep basic financial insights local to the device.

## Features

- Dashboard summary for balance, income, expenses, active budgets, and recent activity
- Add transaction flow for income and expense records
- Budget management with threshold alerts
- Activity history with search and filters
- Reports tab with category breakdowns, trend charts, savings summaries, and financial health status
- Offline-first local storage using AsyncStorage

## Tech Stack

- Expo 54
- React Native 0.81
- React 19
- React Navigation
- TypeScript
- Lucide React Native icons

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

Run on web:

```bash
npm run web
```

## Validation

Run the TypeScript check:

```bash
npm run typecheck
```

On Windows PowerShell, if script execution blocks `npm`, use:

```bash
npm.cmd run typecheck
```

## Project Structure

- `App.tsx` - Main mobile app UI, state, navigation, and screens
- `index.ts` - Expo app entry point
- `assets/` - App icons and splash assets
- `UI_Design/` - Static design references and exported screen concepts
- `TECHNICAL_DESIGN_DOCUMENT.md` - Final-year project technical design document

## Notes

This project is designed as an offline-first mobile budgeting prototype. User records are stored locally on the device, making it suitable for a simple academic project demo and future extension into SQLite-backed persistence.
