# ClaimifyEasy: Medical Insurance Claims SaaS
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/Professional50coder/ClaimifyEasy)

ClaimifyEasy is a comprehensive SaaS platform designed to streamline and accelerate the medical insurance claims process. It provides a collaborative, secure, and real-time environment for patients, hospitals, insurers, and administrators to manage claims from submission to settlement.

## Features

*   **Role-Based Access Control:** Tailored dashboards and permissions for four distinct user roles: Patient, Hospital, Insurer, and Admin.
*   **End-to-End Claim Management:** Create, submit, track, verify, approve, and settle claims through a transparent, multi-step workflow.
*   **Data-Rich Dashboard:** Get an at-a-glance overview of key performance indicators (KPIs) like total claims, approval rates, and processing values with interactive charts.
*   **Smart Contract Integration:** Deploy, manage, and audit blockchain-based smart contracts (Solidity & Rust examples included) for automated, tamper-proof claim settlements.
*   **Advanced Analytics & Reporting:** Deep dive into claims data with detailed charts on trends, status distribution, regional performance, and more.
*   **Document Management:** Securely upload and manage medical documents (prescriptions, reports, bills) associated with claims.
*   **AI-Powered Assistant:** An integrated chat widget powered by Google Gemini provides instant support for queries about claims, policies, and platform usage.
*   **Coverage Calculator:** An interactive tool for users to estimate their out-of-pocket expenses based on their policy details.
*   **Modern Tech Stack:** Built with Next.js App Router, TypeScript, and styled with Tailwind CSS and shadcn/ui for a fast, modern, and responsive user experience.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router & RSC)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **AI:** [Vercel AI SDK](https://sdk.vercel.ai/) with [Google Gemini](https://ai.google.dev/)
-   **Charting:** [Recharts](https://recharts.org/)
-   **Forms:** [React Hook Form](https://react-hook-form.com/)
-   **Data/State:** In-memory mock database (`lib/db.ts`) and React state/context.
-   **Authentication:** Mock cookie-based session management (`lib/auth.ts`).

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or newer)
-   [pnpm](https://pnpm.io/installation)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/professional50coder/claimifyeasy.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd claimifyeasy
    ```

3.  **Install dependencies:**
    ```bash
    pnpm install
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage and Demonstration

The application is designed to be explored from the perspective of different user roles. The login page provides a simple way to simulate this.

1.  Navigate to the `/login` page.
2.  Use the one-click sign-in buttons to log in as a pre-configured user:
    -   **Sign in as Admin:** Full access to all features, including settlement actions and system-wide analytics.
    -   **Sign in as Insurer:** Can review, approve, or reject claims and manage smart contracts.
    -   **Sign in as Hospital:** Can verify claims submitted by patients.
    -   **Sign in as Patient:** Can submit new claims, upload documents, and track their status.

Once logged in, you can navigate through the sidebar to explore the various features available to that specific role.

## Project Structure

The repository is organized to follow modern Next.js conventions:

-   `app/`: Contains all pages, layouts, and API routes using the App Router.
    -   `(auth)/`: Route group for authentication pages like login.
    -   `api/`: Backend API endpoints for tasks like AI chat, auth checks, and document uploads.
    -   Page folders (e.g., `dashboard/`, `claims/`, `contracts/`) define the application's routes.
-   `components/`: Reusable React components.
    -   `ui/`: Core UI primitives from shadcn/ui.
    -   `landing/`: Components specific to the marketing landing page.
    -   Other components for specific features like `analytics-charts.tsx` and `chat/chat-widget.tsx`.
-   `lib/`: Core application logic, utilities, and type definitions.
    -   `auth.ts`: Mock authentication functions.
    -   `db.ts`: In-memory mock database and data access functions.
    -   `contracts-api.ts`: Functions for interacting with the mock blockchain layer.
    -   `sample-data.ts`: Sample data generators and smart contract code examples.
-   `public/`: Static assets, including images for the landing page.
-   `hooks/`: Custom React hooks, such as `use-toast`.
