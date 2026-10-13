-- ==============================================================================
-- Migration: 003_functions_and_triggers.sql
-- Description: Core business logic, secure triggers, versioning, and sharing RPCs
-- ==============================================================================

-- 1. TRIGGER FUNCTION: set_updated_at
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

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_circuits_updated_at ON public.circuits;
CREATE TRIGGER trigger_circuits_updated_at
    BEFORE UPDATE ON public.circuits
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_learning_exercises_updated_at ON public.learning_exercises;
CREATE TRIGGER trigger_learning_exercises_updated_at
    BEFORE UPDATE ON public.learning_exercises
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_feedback_updated_at ON public.feedback;
CREATE TRIGGER trigger_feedback_updated_at
    BEFORE UPDATE ON public.feedback
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- 2. TRIGGER FUNCTION: handle_new_user (Auto-create profile upon Auth signup)
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
    -- Extract initial display name or generate fallback from email
    v_display_name := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    -- Generate a clean username
    v_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 6)
    );

    v_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        'https://api.dicebear.com/7.x/identicon/svg?seed=' || NEW.id::text
    );

    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        avatar_url,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        v_username,
        v_display_name,
        v_avatar,
        'user',
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO NOTHING;

    -- Audit log
    INSERT INTO public.activity_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        metadata
    ) VALUES (
        NEW.id,
        'USER_SIGNUP',
        'profile',
        NEW.id::text,
        jsonb_build_object('email', NEW.email)
    );

    RETURN NEW;
END;
$$;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. TRIGGER FUNCTION: protect_profile_role (Prevent users from elevating their role)
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If role is changing, ensure caller is service_role or admin
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF auth.jwt() ->> 'role' != 'service_role' THEN
            -- Check if current user is an existing admin
            IF NOT EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            ) THEN
                RAISE EXCEPTION 'Access denied: You are not authorized to modify user roles.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_protect_profile_role ON public.profiles;
CREATE TRIGGER trigger_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();


-- 4. FUNCTION: save_circuit_version (Snapshots circuit history)
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
    -- Ensure user owns the circuit
    SELECT * INTO v_circuit FROM public.circuits
    WHERE id = p_circuit_id AND owner_id = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Circuit not found or access denied.';
    END IF;

    -- Calculate next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
    FROM public.circuit_versions
    WHERE circuit_id = p_circuit_id;

    INSERT INTO public.circuit_versions (
        circuit_id,
        version_number,
        circuit_data,
        change_summary,
        created_by
    ) VALUES (
        p_circuit_id,
        v_next_version,
        v_circuit.circuit_data,
        p_change_summary,
        auth.uid()
    )
    RETURNING id INTO v_version_id;

    -- Update version_number on circuit
    UPDATE public.circuits
    SET version_number = v_next_version
    WHERE id = p_circuit_id;

    RETURN v_version_id;
END;
$$;


-- 5. FUNCTION: restore_circuit_version (Restores previous version)
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
    -- Verify ownership
    IF NOT EXISTS (SELECT 1 FROM public.circuits WHERE id = p_circuit_id AND owner_id = auth.uid()) THEN
        RAISE EXCEPTION 'Circuit not found or you do not have permission to modify it.';
    END IF;

    SELECT circuit_data INTO v_version_data
    FROM public.circuit_versions
    WHERE circuit_id = p_circuit_id AND version_number = p_version_number;

    IF v_version_data IS NULL THEN
        RAISE EXCEPTION 'Version % does not exist for this circuit.', p_version_number;
    END IF;

    -- Update circuit data to selected version
    UPDATE public.circuits
    SET
        circuit_data = v_version_data,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_circuit_id;

    -- Record in audit log
    INSERT INTO public.activity_logs (
        user_id, action, entity_type, entity_id, metadata
    ) VALUES (
        auth.uid(),
        'RESTORE_CIRCUIT_VERSION',
        'circuit',
        p_circuit_id::text,
        jsonb_build_object('restored_version', p_version_number)
    );

    RETURN v_version_data;
END;
$$;


-- 6. FUNCTION: get_shared_circuit (Secure read for guest / shared users)
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
    SELECT * INTO v_share
    FROM public.circuit_shares
    WHERE share_token = p_share_token
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()));

    IF NOT FOUND THEN
        -- Also check if circuit itself has this share token
        SELECT * INTO v_circuit
        FROM public.circuits
        WHERE share_token = p_share_token;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid, expired, or revoked share link.';
        END IF;
    ELSE
        SELECT * INTO v_circuit
        FROM public.circuits
        WHERE id = v_share.circuit_id;
    END IF;

    SELECT display_name INTO v_owner_name
    FROM public.profiles
    WHERE id = v_circuit.owner_id;

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


-- 7. FUNCTION: submit_exercise_attempt (Server-validated evaluation)
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
        RAISE EXCEPTION 'Authentication required to submit exercise attempts.';
    END IF;

    SELECT * INTO v_exercise
    FROM public.learning_exercises
    WHERE id = p_exercise_id AND is_published = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Exercise not found.';
    END IF;

    v_expected := v_exercise.expected_answer;

    -- Evaluate submission against expected truth table / outputs
    -- Supports truth_table array comparison or exact match
    IF p_submitted_answer @> v_expected AND v_expected @> p_submitted_answer THEN
        v_is_correct := true;
        v_score := 100;
    ELSIF p_submitted_answer->>'truth_table' IS NOT NULL AND v_expected->>'truth_table' IS NOT NULL THEN
        IF p_submitted_answer->'truth_table' = v_expected->'truth_table' THEN
            v_is_correct := true;
            v_score := 100;
        END IF;
    ELSE
        -- Partial scoring if verified rows count matches
        v_score := 0;
        v_is_correct := false;
    END IF;

    -- Determine attempt number
    SELECT COALESCE(MAX(attempt_number), 0) + 1 INTO v_attempt_count
    FROM public.exercise_attempts
    WHERE user_id = v_user_id AND exercise_id = p_exercise_id;

    INSERT INTO public.exercise_attempts (
        user_id,
        exercise_id,
        submitted_answer,
        score,
        is_correct,
        attempt_number,
        completed_at
    ) VALUES (
        v_user_id,
        p_exercise_id,
        p_submitted_answer,
        v_score,
        v_is_correct,
        v_attempt_count,
        timezone('utc'::text, now())
    )
    RETURNING id INTO v_attempt_id;

    RETURN jsonb_build_object(
        'attempt_id', v_attempt_id,
        'is_correct', v_is_correct,
        'score', v_score,
        'attempt_number', v_attempt_count,
        'explanation', CASE WHEN v_is_correct THEN v_exercise.explanation ELSE 'Review your truth table logic and try again.' END
    );
END;
$$;
