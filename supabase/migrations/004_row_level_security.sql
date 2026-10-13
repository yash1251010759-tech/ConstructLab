-- ==============================================================================
-- Migration: 004_row_level_security.sql
-- Description: Complete Row Level Security (RLS) policies for all tables
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------------------------
-- 2. PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone authenticated can view user profiles (needed for author display)
CREATE POLICY "profiles_select_public"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can only insert their own profile
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- Users can update only their own profile
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Users cannot delete profile directly (handled by auth cascade)
CREATE POLICY "profiles_delete_admin_only"
    ON public.profiles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ------------------------------------------------------------------------------
-- 3. CIRCUITS POLICIES
-- ------------------------------------------------------------------------------
-- Select allowed if:
-- a) User owns the circuit
-- b) Circuit is public
-- c) Circuit is shared via an unrevoked, non-expired share link
-- d) User is an admin
CREATE POLICY "circuits_select_authorized"
    ON public.circuits FOR SELECT
    USING (
        owner_id = auth.uid()
        OR visibility = 'public'
        OR (
            visibility = 'unlisted'
            AND EXISTS (
                SELECT 1 FROM public.circuit_shares
                WHERE circuit_id = circuits.id
                  AND revoked_at IS NULL
                  AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
            )
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert allowed only for logged-in user setting themselves as owner
CREATE POLICY "circuits_insert_own"
    ON public.circuits FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND owner_id = auth.uid()
    );

-- Update allowed only for the owner (cannot change owner_id)
CREATE POLICY "circuits_update_own"
    ON public.circuits FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (
        owner_id = auth.uid()
    );

-- Delete allowed only for the owner or admin
CREATE POLICY "circuits_delete_own"
    ON public.circuits FOR DELETE
    USING (
        owner_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ------------------------------------------------------------------------------
-- 4. CIRCUIT_VERSIONS POLICIES
-- ------------------------------------------------------------------------------
-- Versions can be viewed only by the circuit owner or admin
CREATE POLICY "circuit_versions_select_owner"
    ON public.circuit_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.circuits
            WHERE circuits.id = circuit_versions.circuit_id
              AND (circuits.owner_id = auth.uid() OR circuits.visibility = 'public')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only circuit owner can insert versions
CREATE POLICY "circuit_versions_insert_owner"
    ON public.circuit_versions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.circuits
            WHERE circuits.id = circuit_versions.circuit_id
              AND circuits.owner_id = auth.uid()
        )
    );

-- Versions are immutable (no direct updates)
-- Delete only allowed when parent circuit is deleted or by owner
CREATE POLICY "circuit_versions_delete_owner"
    ON public.circuit_versions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.circuits
            WHERE circuits.id = circuit_versions.circuit_id
              AND circuits.owner_id = auth.uid()
        )
    );


-- ------------------------------------------------------------------------------
-- 5. CIRCUIT_SHARES POLICIES
-- ------------------------------------------------------------------------------
-- Only circuit owner or admin can view share management records
CREATE POLICY "circuit_shares_select_owner"
    ON public.circuit_shares FOR SELECT
    USING (
        owner_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only circuit owner can generate shares
CREATE POLICY "circuit_shares_insert_owner"
    ON public.circuit_shares FOR INSERT
    WITH CHECK (
        owner_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.circuits
            WHERE circuits.id = circuit_shares.circuit_id
              AND circuits.owner_id = auth.uid()
        )
    );

-- Only owner can modify/revoke shares
CREATE POLICY "circuit_shares_update_owner"
    ON public.circuit_shares FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Only owner can delete shares
CREATE POLICY "circuit_shares_delete_owner"
    ON public.circuit_shares FOR DELETE
    USING (owner_id = auth.uid());


-- ------------------------------------------------------------------------------
-- 6. SIMULATION_RUNS POLICIES
-- ------------------------------------------------------------------------------
-- Users can view only their own simulation runs
CREATE POLICY "simulation_runs_select_own"
    ON public.simulation_runs FOR SELECT
    USING (
        user_id = auth.uid()
        OR (user_id IS NULL AND auth.uid() IS NULL)
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can insert simulation runs
CREATE POLICY "simulation_runs_insert_own"
    ON public.simulation_runs FOR INSERT
    WITH CHECK (
        user_id = auth.uid() OR user_id IS NULL
    );

-- Users can delete their own simulation runs
CREATE POLICY "simulation_runs_delete_own"
    ON public.simulation_runs FOR DELETE
    USING (user_id = auth.uid());


-- ------------------------------------------------------------------------------
-- 7. LEARNING_EXERCISES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone can view published exercises (expected_answer is protected through views or RPC)
CREATE POLICY "learning_exercises_select_published"
    ON public.learning_exercises FOR SELECT
    USING (
        is_published = true
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can create, update, or delete exercises
CREATE POLICY "learning_exercises_admin_mutation"
    ON public.learning_exercises FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ------------------------------------------------------------------------------
-- 8. EXERCISE_ATTEMPTS POLICIES
-- ------------------------------------------------------------------------------
-- Users can see only their own exercise attempts
CREATE POLICY "exercise_attempts_select_own"
    ON public.exercise_attempts FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can insert attempts through verified submission
CREATE POLICY "exercise_attempts_insert_own"
    ON public.exercise_attempts FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Attempts cannot be altered by users
CREATE POLICY "exercise_attempts_admin_delete"
    ON public.exercise_attempts FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ------------------------------------------------------------------------------
-- 9. ACTIVITY_LOGS POLICIES
-- ------------------------------------------------------------------------------
-- Users can see only their own activity logs; admins can see all
CREATE POLICY "activity_logs_select_own"
    ON public.activity_logs FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users or service can insert activity logs
CREATE POLICY "activity_logs_insert"
    ON public.activity_logs FOR INSERT
    WITH CHECK (
        user_id = auth.uid() OR user_id IS NULL
    );

-- Activity logs cannot be updated or deleted by normal users
CREATE POLICY "activity_logs_admin_delete"
    ON public.activity_logs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ------------------------------------------------------------------------------
-- 10. FEEDBACK POLICIES
-- ------------------------------------------------------------------------------
-- Users can view only their own feedback; admins view all
CREATE POLICY "feedback_select_own"
    ON public.feedback FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can submit feedback
CREATE POLICY "feedback_insert_own"
    ON public.feedback FOR INSERT
    WITH CHECK (
        user_id = auth.uid() OR user_id IS NULL
    );

-- Only admins can update status or delete feedback
CREATE POLICY "feedback_admin_mutation"
    ON public.feedback FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );
