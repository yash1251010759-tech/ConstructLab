-- ==============================================================================
-- ConstructLab — STREAMLINED CLEAN SETUP SCRIPT (100% Complete & Compact)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLES
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
    last_opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

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

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

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

-- 2. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_circuits_owner ON public.circuits(owner_id);
CREATE INDEX IF NOT EXISTS idx_circuits_vis ON public.circuits(visibility);
CREATE INDEX IF NOT EXISTS idx_circuits_share ON public.circuits(share_token);
CREATE INDEX IF NOT EXISTS idx_shares_token ON public.circuit_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.exercise_attempts(user_id);

-- 3. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_upd ON public.profiles;
CREATE TRIGGER trg_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_circuits_upd ON public.circuits;
CREATE TRIGGER trg_circuits_upd BEFORE UPDATE ON public.circuits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto create profile on auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 6)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/identicon/svg?seed=' || NEW.id::text),
        'user'
    ) ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Version snapshot function
CREATE OR REPLACE FUNCTION public.save_circuit_version(p_circuit_id UUID, p_change_summary TEXT DEFAULT '')
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_circ RECORD;
    v_ver INTEGER;
    v_id UUID;
BEGIN
    SELECT * INTO v_circ FROM public.circuits WHERE id = p_circuit_id AND owner_id = auth.uid();
    IF NOT FOUND THEN RAISE EXCEPTION 'Not found'; END IF;
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_ver FROM public.circuit_versions WHERE circuit_id = p_circuit_id;
    INSERT INTO public.circuit_versions (circuit_id, version_number, circuit_data, change_summary, created_by)
    VALUES (p_circuit_id, v_ver, v_circ.circuit_data, p_change_summary, auth.uid()) RETURNING id INTO v_id;
    UPDATE public.circuits SET version_number = v_ver WHERE id = p_circuit_id;
    RETURN v_id;
END;
$$;

-- Restore version function
CREATE OR REPLACE FUNCTION public.restore_circuit_version(p_circuit_id UUID, p_version_number INTEGER)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_data JSONB;
BEGIN
    SELECT circuit_data INTO v_data FROM public.circuit_versions WHERE circuit_id = p_circuit_id AND version_number = p_version_number;
    IF v_data IS NULL THEN RAISE EXCEPTION 'Version missing'; END IF;
    UPDATE public.circuits SET circuit_data = v_data WHERE id = p_circuit_id AND owner_id = auth.uid();
    RETURN v_data;
END;
$$;

-- Shared circuit lookup
CREATE OR REPLACE FUNCTION public.get_shared_circuit(p_share_token TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_circ RECORD;
    v_owner TEXT;
BEGIN
    SELECT * INTO v_circ FROM public.circuits
    WHERE share_token = p_share_token
       OR id IN (SELECT circuit_id FROM public.circuit_shares WHERE share_token = p_share_token AND revoked_at IS NULL);
    IF NOT FOUND THEN RAISE EXCEPTION 'Invalid link'; END IF;
    SELECT display_name INTO v_owner FROM public.profiles WHERE id = v_circ.owner_id;
    RETURN jsonb_build_object(
        'id', v_circ.id,
        'title', v_circ.title,
        'description', v_circ.description,
        'circuit_data', v_circ.circuit_data,
        'category', v_circ.category,
        'owner_name', COALESCE(v_owner, 'Engineer'),
        'permission', 'read_only'
    );
END;
$$;

-- Exercise grading function
CREATE OR REPLACE FUNCTION public.submit_exercise_attempt(p_exercise_id UUID, p_submitted_answer JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_ex RECORD;
    v_correct BOOLEAN := false;
    v_cnt INTEGER;
    v_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
    SELECT * INTO v_ex FROM public.learning_exercises WHERE id = p_exercise_id;
    IF p_submitted_answer @> v_ex.expected_answer THEN v_correct := true; END IF;
    SELECT COALESCE(MAX(attempt_number), 0) + 1 INTO v_cnt FROM public.exercise_attempts WHERE user_id = auth.uid() AND exercise_id = p_exercise_id;
    INSERT INTO public.exercise_attempts (user_id, exercise_id, submitted_answer, score, is_correct, attempt_number)
    VALUES (auth.uid(), p_exercise_id, p_submitted_answer, CASE WHEN v_correct THEN 100 ELSE 0 END, v_correct, v_cnt) RETURNING id INTO v_id;
    RETURN jsonb_build_object('attempt_id', v_id, 'is_correct', v_correct, 'score', CASE WHEN v_correct THEN 100 ELSE 0 END, 'attempt_number', v_cnt, 'explanation', v_ex.explanation);
END;
$$;

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_write" ON public.profiles FOR ALL USING (id = auth.uid());

CREATE POLICY "circuits_select" ON public.circuits FOR SELECT USING (
    owner_id = auth.uid() OR visibility = 'public' OR share_token IS NOT NULL
);
CREATE POLICY "circuits_insert" ON public.circuits FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "circuits_update" ON public.circuits FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "circuits_delete" ON public.circuits FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "versions_all" ON public.circuit_versions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.circuits WHERE id = circuit_versions.circuit_id AND owner_id = auth.uid())
);

CREATE POLICY "shares_all" ON public.circuit_shares FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "sims_all" ON public.simulation_runs FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "exercises_read" ON public.learning_exercises FOR SELECT USING (true);
CREATE POLICY "attempts_all" ON public.exercise_attempts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "logs_all" ON public.activity_logs FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "feedback_all" ON public.feedback FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

-- 5. VIEWS & SEED EXERCISES
CREATE OR REPLACE VIEW public.view_published_exercises AS
SELECT id, title, description, category, difficulty, exercise_data, explanation, created_at, updated_at
FROM public.learning_exercises WHERE is_published = true;
GRANT SELECT ON public.view_published_exercises TO anon, authenticated;

INSERT INTO public.learning_exercises (id, title, description, category, difficulty, exercise_data, expected_answer, explanation, is_published)
VALUES 
(
    '11111111-1111-1111-1111-111111111101',
    'Half Adder Lab',
    'Design a Half Adder: Connect Switch A and B to XOR (Sum) and AND (Carry) gates.',
    'combinational',
    'beginner',
    '{"title": "Half Adder Starter", "components": [], "wires": []}'::jsonb,
    '{"truth_table": [{"A": 0, "B": 0, "Sum": 0, "Carry": 0}, {"A": 1, "B": 1, "Sum": 0, "Carry": 1}]}'::jsonb,
    'A Half Adder computes: Sum = A XOR B, Carry = A AND B.',
    true
)
ON CONFLICT (id) DO NOTHING;
