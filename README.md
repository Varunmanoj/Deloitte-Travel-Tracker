# Deloitte Travel Tracker

A smart expense tracker that analyzes Uber, Ola, Rapido, and Cityflo receipts to track monthly spending against a corporate allowance.

## Objective

The primary goal of this project is to provide a user-friendly tool for employees to track their travel expenses as part of the Deloitte USI Travel expenses program. It enables users to make informed travel judgments by monitoring their performance against the monthly allowance.

## Features

### Expense Analysis & Budget Tracking
- **Smart Receipt Analysis**: Users can upload receipts from various providers (Uber, Ola, Rapido, Cityflo).
- **Monthly Spend Calculation**: Automatically calculates the total monthly spend based on uploaded receipts.
- **Budget Alerts**:
  - **Under Budget**: Indicates the user is comfortably within the limit.
  - **Approaching Limit**: Warns the user when they are nearing the ₹6500 limit.
  - **Over Budget**: Alerts the user if they have exceeded the limit, helping prevent non-reimbursable spending.

### Program Specifics
- Tailored for the **Deloitte USI Local Transport Reimbursement** program.
- Specifically allows tracking against the **₹6500 monthly allowance** provided for eligible persons with disabilities and women employees.

### Accessibility (a11y)
- **Screen Reader Support**: The application is designed to be fully accessible for PwD (People with Disabilities) using screen readers.

### User Interface
- **Theme Support**: Includes both **Light Mode** and **Dark Mode** for user comfort.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Add your `GEMINI_API_KEY` in [.env.local](.env.local).

3. Run the app:
   ```bash
   npm run dev
   ```
