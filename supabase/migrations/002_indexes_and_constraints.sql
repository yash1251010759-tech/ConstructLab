-- ==============================================================================
-- Migration: 002_indexes_and_constraints.sql
-- Description: Performance indexes and relational foreign key constraints
-- ==============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Circuits indexes
CREATE INDEX IF NOT EXISTS idx_circuits_owner_id ON public.circuits(owner_id);
CREATE INDEX IF NOT EXISTS idx_circuits_visibility ON public.circuits(visibility);
CREATE INDEX IF NOT EXISTS idx_circuits_category ON public.circuits(category);
CREATE INDEX IF NOT EXISTS idx_circuits_share_token ON public.circuits(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_circuits_updated_at ON public.circuits(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_circuits_last_opened_at ON public.circuits(last_opened_at DESC);

-- Circuit Versions indexes
CREATE INDEX IF NOT EXISTS idx_circuit_versions_circuit_id ON public.circuit_versions(circuit_id);
CREATE INDEX IF NOT EXISTS idx_circuit_versions_version_number ON public.circuit_versions(circuit_id, version_number DESC);

-- Circuit Shares indexes
CREATE INDEX IF NOT EXISTS idx_circuit_shares_token ON public.circuit_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_circuit_shares_circuit_id ON public.circuit_shares(circuit_id);
CREATE INDEX IF NOT EXISTS idx_circuit_shares_owner_id ON public.circuit_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_circuit_shares_active ON public.circuit_shares(share_token) WHERE revoked_at IS NULL;

-- Simulation Runs indexes
CREATE INDEX IF NOT EXISTS idx_simulation_runs_circuit_id ON public.simulation_runs(circuit_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_id ON public.simulation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_created_at ON public.simulation_runs(created_at DESC);

-- Learning Exercises indexes
CREATE INDEX IF NOT EXISTS idx_learning_exercises_category ON public.learning_exercises(category);
CREATE INDEX IF NOT EXISTS idx_learning_exercises_difficulty ON public.learning_exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_learning_exercises_published ON public.learning_exercises(is_published);

-- Exercise Attempts indexes
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_id ON public.exercise_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_exercise_id ON public.exercise_attempts(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_completed_at ON public.exercise_attempts(completed_at DESC);

-- Activity Logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
