# Nexo Banking Demo

Nexo is a frontend-only banking dashboard demo built with Next.js. It includes a two-step demo sign-in, account overviews, transaction activity, and a simulated transfer flow. It serves as a proof of concept for frontend design.

> **Demo only:** This project does not connect to a bank or backend. Balances and transactions are mock data, and transfers do not move real money. Authentication and verification run in the browser and are not secure. Do not use real credentials or sensitive information.

## Features

- Dashboard with mock balances, account summaries, and recent activity
- Main, checking, savings, and investment account detail views
- Demo sign-in with a verification-code step
- Transfer review and verification flow with session-only transfer history
- Responsive interface built with Tailwind CSS and Lucide icons

## Libraries and technologies

- **Next.js 15** — React framework used for the application, routes, and development and production servers
- **React 19** — UI library for building interactive pages and components
- **TypeScript 5** — adds static types to the application code
- **Tailwind CSS 4** — utility-first CSS framework for responsive styling
- **Lucide React** — icon components used throughout the interface
- **Geist** — font family used by the interface
- **Radix UI Slot** — component composition utility
- **Class Variance Authority (CVA)** — defines reusable component style variants
- **clsx** and **tailwind-merge** — compose conditional class names and merge Tailwind classes
- **PostCSS** — processes the Tailwind CSS build
- **sessionStorage** — stores the demo sign-in state and transfer history for the current browser session; it is not secure authentication or persistent storage

## Requirements

- Node.js 20 or later
- npm

## Run locally

From the repository root, install dependencies and start the development server:

```bash
cd .ui
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to the sign-in page.

## Demo sign-in

Use the following credentials on the sign-in page:

| Field | Demo value |
| --- | --- |
| Email | `demo@nexo.test` |
| Password | `NexoDemo2026!` |
| Verification code | `123456` |

These fixed values are visible in the frontend source and are for local demonstration only. The session is stored in `sessionStorage` and ends when the browser session is cleared. Demo transfers also accept the verification code above and are stored only for the current browser session.

## Routes

| Route | Description |
| --- | --- |
| `/` | Redirects to sign-in |
| `/login` | Demo sign-in and verification |
| `/home` | Account dashboard |
| `/home/accounts/main` | Main account details |
| `/home/accounts/checking` | Checking account details |
| `/home/accounts/savings` | Savings account details |
| `/home/accounts/investments` | Investment account details |
| `/home/transfer` | Simulated transfer flow |

## Production build

Run these commands from `.ui`:

```bash
npm run build
npm start
```

The production server listens on port `3000` by default. To run the TypeScript check, use:

```bash
npx tsc --noEmit
```

## Project structure

```text
.ui/
  app/          Next.js routes and global styles
  components/   Shared layout and UI components
  lib/          Mock account, transaction, and demo-auth logic
```