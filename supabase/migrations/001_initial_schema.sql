-- ==============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Core schema creation for ConstructLab digital logic platform
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
-- References auth.users(id). Populated automatically on signup via trigger.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CIRCUITS TABLE
-- Main circuit store holding serialized CircuitData (components, wires, viewport)
CREATE TABLE IF NOT EXISTS public.circuits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Circuit',
    description TEXT DEFAULT '',
    circuit_data JSONB NOT NULL DEFAULT '{"components": [], "wires": [], "zoom": 1, "pan": {"x": 0, "y": 0}}'::jsonb,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'unlisted')),
    category TEXT DEFAULT 'general',
    thumbnail_url TEXT,
    share_token TEXT UNIQUE,
    version_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 120),
    CONSTRAINT valid_circuit_data_size CHECK (octet_length(circuit_data::text) <= 5242880) -- 5MB limit
);

-- 3. CIRCUIT_VERSIONS TABLE
-- Immutable historical snapshots for each save / milestone
CREATE TABLE IF NOT EXISTS public.circuit_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circuit_id UUID NOT NULL REFERENCES public.circuits(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    circuit_data JSONB NOT NULL,
    change_summary TEXT DEFAULT '',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_circuit_version UNIQUE(circuit_id, version_number)
);

-- 4. CIRCUIT_SHARES TABLE
-- Granular access share links with secure tokens, expiration, and revocation
CREATE TABLE IF NOT EXISTS public.circuit_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circuit_id UUID NOT NULL REFERENCES public.circuits(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    permission TEXT NOT NULL DEFAULT 'read_only' CHECK (permission IN ('read_only', 'can_edit')),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. SIMULATION_RUNS TABLE
-- Persists diagnostic runs, test vector evaluations, or waveform history
CREATE TABLE IF NOT EXISTS public.simulation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circuit_id UUID REFERENCES public.circuits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    input_values JSONB DEFAULT '{}'::jsonb,
    output_values JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'error')),
    execution_duration_ms INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. LEARNING_EXERCISES TABLE
-- Educational problems (combinational logic, flip-flops, adders, truth table matching)
CREATE TABLE IF NOT EXISTS public.learning_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('gates', 'combinational', 'sequential', 'arithmetic', 'advanced')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    exercise_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    expected_answer JSONB NOT NULL DEFAULT '{}'::jsonb,
    explanation TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. EXERCISE_ATTEMPTS TABLE
-- Records student submissions and verified scores
CREATE TABLE IF NOT EXISTS public.exercise_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.learning_exercises(id) ON DELETE CASCADE,
    submitted_answer JSONB NOT NULL DEFAULT '{}'::jsonb,
    score NUMERIC NOT NULL DEFAULT 0,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. ACTIVITY_LOGS TABLE
-- Security and event audit trail
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. FEEDBACK TABLE
-- Bug reports and feature recommendations
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('bug', 'feature_request', 'general', 'improvement')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
