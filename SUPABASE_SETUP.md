# ConstructLab — Supabase Backend Integration Setup Guide

This guide walks you through setting up **Supabase PostgreSQL** as the primary cloud backend for **ConstructLab**.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com/](https://supabase.com/) and sign in.
2. Click **"New Project"**.
3. Fill in the details:
   - **Name**: `ConstructLab`
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Select the region closest to your users.
4. Click **"Create new project"** and wait 1–2 minutes for the database to provision.

---

## 2. Retrieve API Credentials

1. In your Supabase Dashboard, navigate to **Project Settings** (gear icon) &rarr; **API**.
2. Copy the following values:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API Keys &rarr; `anon` / `public` key** (starts with `eyJh...`)
   > [!IMPORTANT]
   > **Never** use or expose the `service_role` secret key in the frontend or commit it to GitHub. Only use the `anon` public key.

---

## 3. Configure Local Environment Variables

1. In the root of the project, create a `.env` file (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
2. Populate the keys:
   ```env
   VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
   VITE_SUPABASE_ANON_KEY="YOUR_ANON_PUBLIC_KEY"
   GEMINI_API_KEY="YOUR_GEMINI_KEY"
   PORT=3000
   ```

---

## 4. Execute SQL Migrations in Order

Navigate to **SQL Editor** in your Supabase dashboard and run each migration in the `supabase/migrations/` folder in the following sequence:

### **Migration 1: Core Schema**
- File: [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql)
- Creates tables: `profiles`, `circuits`, `circuit_versions`, `circuit_shares`, `simulation_runs`, `learning_exercises`, `exercise_attempts`, `activity_logs`, `feedback`.

### **Migration 2: Indexes and Constraints**
- File: [`supabase/migrations/002_indexes_and_constraints.sql`](./supabase/migrations/002_indexes_and_constraints.sql)
- Adds composite and foreign key indexes for lightning-fast queries.

### **Migration 3: Functions, Triggers & Grading Engine**
- File: [`supabase/migrations/003_functions_and_triggers.sql`](./supabase/migrations/003_functions_and_triggers.sql)
- Implements:
  - Automatic profile creation on auth signup (`handle_new_user`).
  - Role escalation prevention (`protect_profile_role`).
  - Snapshot versioning (`save_circuit_version`, `restore_circuit_version`).
  - Unguessable token sharing resolver (`get_shared_circuit`).
  - Server-side truth table exercise grading (`submit_exercise_attempt`).

### **Migration 4: Row Level Security (RLS)**
- File: [`supabase/migrations/004_row_level_security.sql`](./supabase/migrations/004_row_level_security.sql)
- Enables RLS on all 9 tables. Ensures private circuits, versions, and exercise attempts can only be accessed or modified by their owners.

### **Migration 5: Views and Starter Curriculum**
- File: [`supabase/migrations/005_views_and_seed_data.sql`](./supabase/migrations/005_views_and_seed_data.sql)
- Creates safe student exercise views (`view_published_exercises` hiding expected answers) and seeds starter exercises:
  1. *Half Adder Construction*
  2. *2-to-1 Multiplexer (MUX) Challenge*
  3. *SR Latch Memory Cell*

---

## 5. Configure Authentication

1. In Supabase Dashboard, go to **Authentication** &rarr; **Providers** &rarr; **Email**.
2. Ensure **Enable Email provider** is turned **ON**.
3. (Optional for local testing): Turn off **Confirm email** under Email Provider settings if you want immediate logins without clicking an email verification link.

---

## 6. Run the Application Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:3000`.

---

## 7. Verify Supabase Cloud Integration

1. **Sign Up**: Click the **Sign In** button in the header, toggle to **Create Account**, and sign up with an email.
2. **Cloud Save**: Build or modify any circuit on the canvas and click **Save** in the top bar. You will see a success confirmation and timestamp.
3. **Repository Manager**: Click **Circuits** in the header. Your circuit will appear with metadata, gate count, and wire count.
4. **Versioning**: Save a few modifications. Open **Circuits &rarr; Versions** to view snapshots and rollback.
5. **Secure Sharing**: Click **Share** to generate an unguessable read-only link. Open the link in an incognito window: it loads the circuit with a read-only badge and a "Fork to My Account" button.
6. **Learning Lab**: Click **Lab** in the header, choose an exercise (e.g. *Half Adder*), load it to the canvas, wire it up, and click **Verify Current Canvas** to receive an automated score from Supabase!

---

## 8. Deployment to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
   - `GEMINI_API_KEY` = your Gemini API Key
4. Deploy!
