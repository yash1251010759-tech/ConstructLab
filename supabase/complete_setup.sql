-- ==============================================================================
-- ConstructLab — COMPLETE ALL-IN-ONE SUPABASE SETUP SCRIPT
-- Paste this entire script into your Supabase SQL Editor and click RUN.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: EXTENSIONS & TABLES
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table
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

-- 2. Circuits Table
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
    CONSTRAINT valid_circuit_data_size CHECK (octet_length(circuit_data::text) <= 5242880)
);

-- 3. Circuit Versions Table
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

-- 4. Circuit Shares Table
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

-- 5. Simulation Runs Table
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

-- 6. Learning Exercises Table
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

-- 7. Exercise Attempts Table
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

-- 8. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Feedback Table
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

-- ------------------------------------------------------------------------------
-- PART 2: INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_circuits_owner_id ON public.circuits(owner_id);
CREATE INDEX IF NOT EXISTS idx_circuits_visibility ON public.circuits(visibility);
CREATE INDEX IF NOT EXISTS idx_circuits_category ON public.circuits(category);
CREATE INDEX IF NOT EXISTS idx_circuits_share_token ON public.circuits(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_circuits_updated_at ON public.circuits(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_circuits_last_opened_at ON public.circuits(last_opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_circuit_versions_circuit_id ON public.circuit_versions(circuit_id);
CREATE INDEX IF NOT EXISTS idx_circuit_versions_version_number ON public.circuit_versions(circuit_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_circuit_shares_token ON public.circuit_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_circuit_shares_circuit_id ON public.circuit_shares(circuit_id);
CREATE INDEX IF NOT EXISTS idx_circuit_shares_owner_id ON public.circuit_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_circuit_shares_active ON public.circuit_shares(share_token) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_simulation_runs_circuit_id ON public.simulation_runs(circuit_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_id ON public.simulation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_created_at ON public.simulation_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_exercises_category ON public.learning_exercises(category);
CREATE INDEX IF NOT EXISTS idx_learning_exercises_difficulty ON public.learning_exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_learning_exercises_published ON public.learning_exercises(is_published);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_id ON public.exercise_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_exercise_id ON public.exercise_attempts(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_completed_at ON public.exercise_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- ------------------------------------------------------------------------------
-- PART 3: FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_circuits_updated_at ON public.circuits;
CREATE TRIGGER trigger_circuits_updated_at BEFORE UPDATE ON public.circuits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_learning_exercises_updated_at ON public.learning_exercises;
CREATE TRIGGER trigger_learning_exercises_updated_at BEFORE UPDATE ON public.learning_exercises FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_feedback_updated_at ON public.feedback;
CREATE TRIGGER trigger_feedback_updated_at BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto create profile on auth user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_username TEXT;
    v_display_name TEXT;
    v_avatar TEXT;
BEGIN
    v_display_name := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    v_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 6)
    );

    v_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        'https://api.dicebear.com/7.x/identicon/svg?seed=' || NEW.id::text
    );

    INSERT INTO public.profiles (
        id, username, display_name, avatar_url, role, created_at, updated_at
    ) VALUES (
        NEW.id, v_username, v_display_name, v_avatar, 'user', timezone('utc'::text, now()), timezone('utc'::text, now())
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.activity_logs (
        user_id, action, entity_type, entity_id, metadata
    ) VALUES (
        NEW.id, 'USER_SIGNUP', 'profile', NEW.id::text, jsonb_build_object('email', NEW.email)
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Protect profile role escalation
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF auth.jwt() ->> 'role' != 'service_role' THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
            ) THEN
                RAISE EXCEPTION 'Access denied: You are not authorized to modify user roles.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_protect_profile_role ON public.profiles;
CREATE TRIGGER trigger_protect_profile_role BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- Save circuit version function
CREATE OR REPLACE FUNCTION public.save_circuit_version(
    p_circuit_id UUID,
    p_change_summary TEXT DEFAULT 'Automated snapshot'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_circuit RECORD;
    v_next_version INTEGER;
    v_version_id UUID;
BEGIN
    SELECT * INTO v_circuit FROM public.circuits WHERE id = p_circuit_id AND owner_id = auth.uid();
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Circuit not found or access denied.';
    END IF;

    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version FROM public.circuit_versions WHERE circuit_id = p_circuit_id;

    INSERT INTO public.circuit_versions (
        circuit_id, version_number, circuit_data, change_summary, created_by
    ) VALUES (
        p_circuit_id, v_next_version, v_circuit.circuit_data, p_change_summary, auth.uid()
    ) RETURNING id INTO v_version_id;

    UPDATE public.circuits SET version_number = v_next_version WHERE id = p_circuit_id;
    RETURN v_version_id;
END;
$$;

-- Restore circuit version function
CREATE OR REPLACE FUNCTION public.restore_circuit_version(
    p_circuit_id UUID,
    p_version_number INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_version_data JSONB;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.circuits WHERE id = p_circuit_id AND owner_id = auth.uid()) THEN
        RAISE EXCEPTION 'Circuit not found or access denied.';
    END IF;

    SELECT circuit_data INTO v_version_data FROM public.circuit_versions WHERE circuit_id = p_circuit_id AND version_number = p_version_number;
    IF v_version_data IS NULL THEN
        RAISE EXCEPTION 'Version % does not exist.', p_version_number;
    END IF;

    UPDATE public.circuits SET circuit_data = v_version_data, updated_at = timezone('utc'::text, now()) WHERE id = p_circuit_id;
    RETURN v_version_data;
END;
$$;

-- Secure shared circuit lookup
CREATE OR REPLACE FUNCTION public.get_shared_circuit(p_share_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_share RECORD;
    v_circuit RECORD;
    v_owner_name TEXT;
BEGIN
    SELECT * INTO v_share FROM public.circuit_shares
    WHERE share_token = p_share_token AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()));

    IF NOT FOUND THEN
        SELECT * INTO v_circuit FROM public.circuits WHERE share_token = p_share_token;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid, expired, or revoked share link.';
        END IF;
    ELSE
        SELECT * INTO v_circuit FROM public.circuits WHERE id = v_share.circuit_id;
    END IF;

    SELECT display_name INTO v_owner_name FROM public.profiles WHERE id = v_circuit.owner_id;

    RETURN jsonb_build_object(
        'id', v_circuit.id,
        'title', v_circuit.title,
        'description', v_circuit.description,
        'circuit_data', v_circuit.circuit_data,
        'category', v_circuit.category,
        'owner_name', COALESCE(v_owner_name, 'Anonymous Engineer'),
        'created_at', v_circuit.created_at,
        'updated_at', v_circuit.updated_at,
        'permission', COALESCE(v_share.permission, 'read_only')
    );
END;
$$;

-- Server-side exercise evaluation
CREATE OR REPLACE FUNCTION public.submit_exercise_attempt(
    p_exercise_id UUID,
    p_submitted_answer JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_exercise RECORD;
    v_expected JSONB;
    v_is_correct BOOLEAN := false;
    v_score NUMERIC := 0;
    v_attempt_count INTEGER;
    v_attempt_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    SELECT * INTO v_exercise FROM public.learning_exercises WHERE id = p_exercise_id AND is_published = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Exercise not found.';
    END IF;

    v_expected := v_exercise.expected_answer;

    IF p_submitted_answer @> v_expected AND v_expected @> p_submitted_answer THEN
        v_is_correct := true;
        v_score := 100;
    ELSIF p_submitted_answer->>'truth_table' IS NOT NULL AND v_expected->>'truth_table' IS NOT NULL THEN
        IF p_submitted_answer->'truth_table' = v_expected->'truth_table' THEN
            v_is_correct := true;
            v_score := 100;
        END IF;
    END IF;

    SELECT COALESCE(MAX(attempt_number), 0) + 1 INTO v_attempt_count FROM public.exercise_attempts WHERE user_id = v_user_id AND exercise_id = p_exercise_id;

    INSERT INTO public.exercise_attempts (
        user_id, exercise_id, submitted_answer, score, is_correct, attempt_number, completed_at
    ) VALUES (
        v_user_id, p_exercise_id, p_submitted_answer, v_score, v_is_correct, v_attempt_count, timezone('utc'::text, now())
    ) RETURNING id INTO v_attempt_id;

    RETURN jsonb_build_object(
        'attempt_id', v_attempt_id,
        'is_correct', v_is_correct,
        'score', v_score,
        'attempt_number', v_attempt_count,
        'explanation', CASE WHEN v_is_correct THEN v_exercise.explanation ELSE 'Review your truth table logic and try again.' END
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- PART 4: ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;
CREATE POLICY "profiles_delete_admin_only" ON public.profiles FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Circuits Policies
DROP POLICY IF EXISTS "circuits_select_authorized" ON public.circuits;
CREATE POLICY "circuits_select_authorized" ON public.circuits FOR SELECT USING (
    owner_id = auth.uid() OR visibility = 'public' OR (
        visibility = 'unlisted' AND EXISTS (
            SELECT 1 FROM public.circuit_shares WHERE circuit_id = circuits.id AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
        )
    ) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "circuits_insert_own" ON public.circuits;
CREATE POLICY "circuits_insert_own" ON public.circuits FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

DROP POLICY IF EXISTS "circuits_update_own" ON public.circuits;
CREATE POLICY "circuits_update_own" ON public.circuits FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "circuits_delete_own" ON public.circuits;
CREATE POLICY "circuits_delete_own" ON public.circuits FOR DELETE USING (
    owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Circuit Versions Policies
DROP POLICY IF EXISTS "circuit_versions_select_owner" ON public.circuit_versions;
CREATE POLICY "circuit_versions_select_owner" ON public.circuit_versions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.circuits WHERE circuits.id = circuit_versions.circuit_id AND (circuits.owner_id = auth.uid() OR circuits.visibility = 'public'))
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "circuit_versions_insert_owner" ON public.circuit_versions;
CREATE POLICY "circuit_versions_insert_owner" ON public.circuit_versions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.circuits WHERE circuits.id = circuit_versions.circuit_id AND circuits.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "circuit_versions_delete_owner" ON public.circuit_versions;
CREATE POLICY "circuit_versions_delete_owner" ON public.circuit_versions FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.circuits WHERE circuits.id = circuit_versions.circuit_id AND circuits.owner_id = auth.uid())
);

-- Circuit Shares Policies
DROP POLICY IF EXISTS "circuit_shares_select_owner" ON public.circuit_shares;
CREATE POLICY "circuit_shares_select_owner" ON public.circuit_shares FOR SELECT USING (
    owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "circuit_shares_insert_owner" ON public.circuit_shares;
CREATE POLICY "circuit_shares_insert_owner" ON public.circuit_shares FOR INSERT WITH CHECK (
    owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.circuits WHERE circuits.id = circuit_shares.circuit_id AND circuits.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "circuit_shares_update_owner" ON public.circuit_shares;
CREATE POLICY "circuit_shares_update_owner" ON public.circuit_shares FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "circuit_shares_delete_owner" ON public.circuit_shares;
CREATE POLICY "circuit_shares_delete_owner" ON public.circuit_shares FOR DELETE USING (owner_id = auth.uid());

-- Simulation Runs Policies
DROP POLICY IF EXISTS "simulation_runs_select_own" ON public.simulation_runs;
CREATE POLICY "simulation_runs_select_own" ON public.simulation_runs FOR SELECT USING (
    user_id = auth.uid() OR (user_id IS NULL AND auth.uid() IS NULL) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "simulation_runs_insert_own" ON public.simulation_runs;
CREATE POLICY "simulation_runs_insert_own" ON public.simulation_runs FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "simulation_runs_delete_own" ON public.simulation_runs;
CREATE POLICY "simulation_runs_delete_own" ON public.simulation_runs FOR DELETE USING (user_id = auth.uid());

-- Learning Exercises Policies
DROP POLICY IF EXISTS "learning_exercises_select_published" ON public.learning_exercises;
CREATE POLICY "learning_exercises_select_published" ON public.learning_exercises FOR SELECT USING (
    is_published = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "learning_exercises_admin_mutation" ON public.learning_exercises;
CREATE POLICY "learning_exercises_admin_mutation" ON public.learning_exercises FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Exercise Attempts Policies
DROP POLICY IF EXISTS "exercise_attempts_select_own" ON public.exercise_attempts;
CREATE POLICY "exercise_attempts_select_own" ON public.exercise_attempts FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "exercise_attempts_insert_own" ON public.exercise_attempts;
CREATE POLICY "exercise_attempts_insert_own" ON public.exercise_attempts FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "exercise_attempts_admin_delete" ON public.exercise_attempts;
CREATE POLICY "exercise_attempts_admin_delete" ON public.exercise_attempts FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Activity Logs Policies
DROP POLICY IF EXISTS "activity_logs_select_own" ON public.activity_logs;
CREATE POLICY "activity_logs_select_own" ON public.activity_logs FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "activity_logs_insert" ON public.activity_logs;
CREATE POLICY "activity_logs_insert" ON public.activity_logs FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "activity_logs_admin_delete" ON public.activity_logs;
CREATE POLICY "activity_logs_admin_delete" ON public.activity_logs FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Feedback Policies
DROP POLICY IF EXISTS "feedback_select_own" ON public.feedback;
CREATE POLICY "feedback_select_own" ON public.feedback FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "feedback_insert_own" ON public.feedback;
CREATE POLICY "feedback_insert_own" ON public.feedback FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "feedback_admin_mutation" ON public.feedback;
CREATE POLICY "feedback_admin_mutation" ON public.feedback FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ------------------------------------------------------------------------------
-- PART 5: SECURE VIEWS & SEED DATA
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.view_published_exercises AS
SELECT id, title, description, category, difficulty, exercise_data, explanation, created_at, updated_at
FROM public.learning_exercises WHERE is_published = true;

GRANT SELECT ON public.view_published_exercises TO anon, authenticated;

CREATE OR REPLACE VIEW public.view_user_stats AS
SELECT
    p.id AS user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.role,
    COUNT(DISTINCT c.id) AS total_circuits,
    COUNT(DISTINCT CASE WHEN c.visibility = 'public' THEN c.id END) AS public_circuits,
    COUNT(DISTINCT v.id) AS total_versions,
    COUNT(DISTINCT s.id) AS total_simulations,
    COUNT(DISTINCT CASE WHEN ea.is_correct THEN ea.exercise_id END) AS completed_exercises
FROM public.profiles p
LEFT JOIN public.circuits c ON c.owner_id = p.id
LEFT JOIN public.circuit_versions v ON v.created_by = p.id
LEFT JOIN public.simulation_runs s ON s.user_id = p.id
LEFT JOIN public.exercise_attempts ea ON ea.user_id = p.id
WHERE p.id = auth.uid()
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.role;

GRANT SELECT ON public.view_user_stats TO authenticated;

-- Seed Exercises
INSERT INTO public.learning_exercises (
    id, title, description, category, difficulty, exercise_data, expected_answer, explanation, is_published
) VALUES
(
    '11111111-1111-1111-1111-111111111101',
    'Half Adder Construction',
    'Design a Half Adder using an XOR gate for Sum and an AND gate for Carry. Connect Switch A and Switch B to both gates and verify output LEDs.',
    'combinational',
    'beginner',
    '{
        "title": "Half Adder Starter Canvas",
        "description": "Wire the two inputs A and B to the XOR gate (Sum) and AND gate (Carry).",
        "components": [
            { "id": "sw_a", "type": "INPUT_SWITCH", "label": "Input A", "x": 100, "y": 140, "rotation": 0, "ports": [{"id": "out", "name": "A", "type": "output", "relX": 60, "relY": 25, "value": 0}], "state": {"isOn": false} },
            { "id": "sw_b", "type": "INPUT_SWITCH", "label": "Input B", "x": 100, "y": 240, "rotation": 0, "ports": [{"id": "out", "name": "B", "type": "output", "relX": 60, "relY": 25, "value": 0}], "state": {"isOn": false} },
            { "id": "xor_1", "type": "XOR", "label": "XOR (Sum)", "x": 300, "y": 140, "rotation": 0, "ports": [{"id": "in0", "name": "in0", "type": "input", "relX": 0, "relY": 15, "value": 0}, {"id": "in1", "name": "in1", "type": "input", "relX": 0, "relY": 35, "value": 0}, {"id": "out", "name": "out", "type": "output", "relX": 70, "relY": 25, "value": 0}], "state": {} },
            { "id": "and_1", "type": "AND", "label": "AND (Carry)", "x": 300, "y": 240, "rotation": 0, "ports": [{"id": "in0", "name": "in0", "type": "input", "relX": 0, "relY": 15, "value": 0}, {"id": "in1", "name": "in1", "type": "input", "relX": 0, "relY": 35, "value": 0}, {"id": "out", "name": "out", "type": "output", "relX": 70, "relY": 25, "value": 0}], "state": {} },
            { "id": "led_sum", "type": "LED", "label": "Sum (S)", "x": 500, "y": 140, "rotation": 0, "ports": [{"id": "in", "name": "in", "type": "input", "relX": 0, "relY": 20, "value": 0}], "state": {"color": "#3B82F6"} },
            { "id": "led_carry", "type": "LED", "label": "Carry (C)", "x": 500, "y": 240, "rotation": 0, "ports": [{"id": "in", "name": "in", "type": "input", "relX": 0, "relY": 20, "value": 0}], "state": {"color": "#10B981"} }
        ],
        "wires": []
    }'::jsonb,
    '{
        "truth_table": [
            { "A": 0, "B": 0, "Sum": 0, "Carry": 0 },
            { "A": 0, "B": 1, "Sum": 1, "Carry": 0 },
            { "A": 1, "B": 0, "Sum": 1, "Carry": 0 },
            { "A": 1, "B": 1, "Sum": 0, "Carry": 1 }
        ]
    }'::jsonb,
    'A half adder computes the arithmetic sum of two 1-bit binary digits: Sum = A XOR B, Carry = A AND B.',
    true
),
(
    '11111111-1111-1111-1111-111111111102',
    '2-to-1 Multiplexer (MUX) Challenge',
    'Create a 2:1 Multiplexer that chooses between Input D0 and Input D1 depending on the Select line (S). When S=0, Out=D0. When S=1, Out=D1.',
    'combinational',
    'beginner',
    '{
        "title": "2-to-1 MUX Implementation",
        "description": "Construct Out = (D0 AND NOT S) OR (D1 AND S)",
        "components": [
            { "id": "sw_d0", "type": "INPUT_SWITCH", "label": "Input D0", "x": 100, "y": 120, "rotation": 0, "ports": [{"id": "out", "name": "D0", "type": "output", "relX": 60, "relY": 25, "value": 0}], "state": {"isOn": false} },
            { "id": "sw_d1", "type": "INPUT_SWITCH", "label": "Input D1", "x": 100, "y": 200, "rotation": 0, "ports": [{"id": "out", "name": "D1", "type": "output", "relX": 60, "relY": 25, "value": 0}], "state": {"isOn": false} },
            { "id": "sw_sel", "type": "INPUT_SWITCH", "label": "Select (S)", "x": 100, "y": 300, "rotation": 0, "ports": [{"id": "out", "name": "S", "type": "output", "relX": 60, "relY": 25, "value": 0}], "state": {"isOn": false} },
            { "id": "mux_mod", "type": "MUX_2_1", "label": "2:1 MUX", "x": 320, "y": 180, "rotation": 0, "ports": [{"id": "in0", "name": "in0", "type": "input", "relX": 0, "relY": 15, "value": 0}, {"id": "in1", "name": "in1", "type": "input", "relX": 0, "relY": 35, "value": 0}, {"id": "sel", "name": "sel", "type": "input", "relX": 25, "relY": 60, "value": 0}, {"id": "out", "name": "out", "type": "output", "relX": 60, "relY": 25, "value": 0}], "state": {} },
            { "id": "led_out", "type": "LED", "label": "MUX Output", "x": 480, "y": 180, "rotation": 0, "ports": [{"id": "in", "name": "in", "type": "input", "relX": 0, "relY": 20, "value": 0}], "state": {"color": "#EC4899"} }
        ],
        "wires": []
    }'::jsonb,
    '{
        "truth_table": [
            { "S": 0, "D0": 0, "D1": 0, "Out": 0 },
            { "S": 0, "D0": 1, "D1": 0, "Out": 1 },
            { "S": 1, "D0": 0, "D1": 1, "Out": 1 },
            { "S": 1, "D0": 1, "D1": 0, "Out": 0 }
        ]
    }'::jsonb,
    'A 2-to-1 Multiplexer routes one of two data inputs to a single output line based on the state of the Select control line.',
    true
),
(
    '11111111-1111-1111-1111-111111111103',
    'SR Latch Memory Cell',
    'Understand digital state memory by wiring an SR (Set-Reset) Latch. Test the Set condition, Reset condition, and observe output retention.',
    'sequential',
    'intermediate',
    '{
        "title": "SR Latch Memory Starter",
        "description": "Wire S and R inputs to the SR Latch and inspect complementary Q and Q_bar outputs.",
        "components": [
            { "id": "sw_s", "type": "INPUT_SWITCH", "label": "Set (S)", "x": 100, "y": 140, "rotation": 0, "ports": [{"id": "out", "name": "S", "type": "output", "relX": 60, "relY": 25, "value": 0}], "state": {"isOn": false} },
            { "id": "sw_r", "type": "INPUT_SWITCH", "label": "Reset (R)", "x": 100, "y": 240, "rotation": 0, "ports": [{"id": "out", "name": "R", "type": "output", "relX": 60, "relY": 25, "value": 0}], "state": {"isOn": false} },
            { "id": "sr_1", "type": "SR_LATCH", "label": "SR Latch", "x": 300, "y": 180, "rotation": 0, "ports": [{"id": "s", "name": "S", "type": "input", "relX": 0, "relY": 15, "value": 0}, {"id": "r", "name": "R", "type": "input", "relX": 0, "relY": 45, "value": 0}, {"id": "q", "name": "Q", "type": "output", "relX": 60, "relY": 15, "value": 0}, {"id": "qbar", "name": "Q_bar", "type": "output", "relX": 60, "relY": 45, "value": 1}], "state": {"qState": 0, "qBarState": 1} },
            { "id": "led_q", "type": "LED", "label": "Output Q", "x": 480, "y": 140, "rotation": 0, "ports": [{"id": "in", "name": "in", "type": "input", "relX": 0, "relY": 20, "value": 0}], "state": {"color": "#10B981"} },
            { "id": "led_qbar", "type": "LED", "label": "Output Q_bar", "x": 480, "y": 240, "rotation": 0, "ports": [{"id": "in", "name": "in", "type": "input", "relX": 0, "relY": 20, "value": 1}], "state": {"color": "#EF4444"} }
        ],
        "wires": []
    }'::jsonb,
    '{
        "truth_table": [
            { "S": 1, "R": 0, "Q": 1, "Qbar": 0 },
            { "S": 0, "R": 0, "Q": 1, "Qbar": 0 },
            { "S": 0, "R": 1, "Q": 0, "Qbar": 1 }
        ]
    }'::jsonb,
    'The Set-Reset latch forms the fundamental unit of static RAM. Setting S=1 forces Q=1; setting R=1 forces Q=0; when S=0 and R=0, the previous state is held indefinitely.',
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    exercise_data = EXCLUDED.exercise_data,
    expected_answer = EXCLUDED.expected_answer,
    explanation = EXCLUDED.explanation;
