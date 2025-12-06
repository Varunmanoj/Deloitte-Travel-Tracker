# Deloitte Travel Tracker

![Deloitte Travel Tracker Banner](Banner%20Image.png)

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

### Accessibility
- **Screen Reader Support**: The application is designed to be fully accessible for PwD (People with Disabilities) using screen readers.
- **Keyboard Navigation**: The application is designed to be fully accessible for PwD (People with Disabilities) using screen readers.

### Keyboard Shortcuts
- **ALT+U**: Navigate to the Upload Receipts section.


### User Interface
- **Theme Support**: Includes both **Light Mode** and **Dark Mode** for user comfort.

## Data Storage & Processing

The application operates completely client-side for data persistence while leveraging cloud AI for processing.

### Data Storage
- **Local Storage**: All receipt data is persisted locally in the user's browser using `localStorage`. This ensures that your data remains on your device and persists across sessions without requiring a backend database.
  

### Data Processing
- **AI Integration**: Receipt parsing is powered by **Google Gemini 2.0 Flash** Model.  

  - When a file is uploaded, it is converted to base64 and sent to the Gemini API.
  - The model extracts key details (Date, Time, Amount, Locations) and infers the trip type (e.g., "Home to Office") based on location context.
- **Aggregation Logic**:
  - The main application logic aggregates daily expenses into monthly views.
  - It automatically calculates the total monthly spend against the **₹6500** allowance.
  - Statuses (`Safe`, `Warning`, `OverBudget`) are computed in real-time based on the aggregated totals.

## Run Locally

**Prerequisites:** Node.js
1. Download the repository and extract the zip file.
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Add your `GEMINI_API_KEY` in [.env.local](.env.local).

4. Run the app:
   ```bash
   npm run dev
   ```
