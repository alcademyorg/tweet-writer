# .cursorrules

## Project Overview

*   **Type:** cursorrules_file
*   **Description:** A web application that enables users to authenticate via Twitter, import their tweets, and use an AI (GPT-4o) to analyze their writing style and generate new, style-mimicking tweets. The app leverages Twitter OAuth, the twitter-api-v2 npm library, and integrates features like a dashboard, analysis/generation interface, and optional Twilio posting, all styled with Tailwind CSS and shadcn in a Next.js 14 environment with TypeScript.
*   **Primary Goal:** Provide a seamless, secure, and intuitive experience for users to manage their Twitter content, analyze their unique writing style, and generate personalized new content using AI.

## Project Structure

### Framework-Specific Routing

*   **Directory Rules:**

    *   Next.js 14: Uses the App Router with the structure `app/[route]/page.tsx` for modular and nested routing.
    *   Example 1: "Next.js 14 (App Router)" → follows `app/auth/login/page.tsx` for authentication flows.
    *   Example 2: Not applicable as the Pages Router is not used in this project.
    *   Example 3: Not applicable since React Router is not in use.

### Core Directories

*   **Versioned Structure:**

    *   app/api: Implements Next.js 14 API routes with Route Handlers for backend integrations (e.g., Twitter API, Supabase services).
    *   app/dashboard: Contains layouts and components specific to user dashboard functionalities, including tweet displays and analysis triggers.

### Key Files

*   **Stack-Versioned Patterns:**

    *   app/dashboard/layout.tsx: Acts as the root layout for dashboard pages, ensuring consistent structure and style across the app.
    *   app/auth/login/page.tsx: Manages the Twitter OAuth login flow, critical for secure authentication.

## Tech Stack Rules

*   **Version Enforcement:**

    *   next@14: Enforces the use of the App Router; prohibits mixing legacy routing patterns (e.g., no use of `pages/` directory or `getInitialProps`).
    *   <typescript@4.x>: Ensures type safety across the application.
    *   tailwindcss with shadcn: Adheres to modern styling guidelines with a blue primary color theme.

## PRD Compliance

*   **Non-Negotiable:**

    *   "Using Next.js 14 with the app router for server-side rendered pages, TypeScript for type safety, and Tailwind CSS with shadcn for styling": Enforces the modern, efficient development practices as outlined in the project requirements document (PRD).

## App Flow Integration

*   **Stack-Aligned Flow:**

    *   Next.js 14 Auth Flow → `app/auth/login/page.tsx` utilizes server actions for Twitter OAuth, which then routes securely to the dashboard (`app/dashboard/`) displaying imported tweets and leads to the analysis/generation interface for AI-powered content creation.
