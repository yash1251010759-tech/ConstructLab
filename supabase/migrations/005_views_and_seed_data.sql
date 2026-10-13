-- ==============================================================================
-- Migration: 005_views_and_seed_data.sql
-- Description: Secure public views, aggregated analytics, and starter learning seed data
-- ==============================================================================

-- 1. SECURE VIEW: view_published_exercises
-- Exposes exercises to students without revealing expected_answer
CREATE OR REPLACE VIEW public.view_published_exercises AS
SELECT
    id,
    title,
    description,
    category,
    difficulty,
    exercise_data,
    explanation,
    created_at,
    updated_at
FROM public.learning_exercises
WHERE is_published = true;

-- Grant select on view
GRANT SELECT ON public.view_published_exercises TO anon, authenticated;


-- 2. USER STATISTICS VIEW: view_user_stats
-- Computes private dashboard statistics without leaking other users' data
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


-- 3. SEED DATA: Learning Exercises
-- Populate curriculum for logic gates, combinational circuits, and sequential logic

INSERT INTO public.learning_exercises (
    id,
    title,
    description,
    category,
    difficulty,
    exercise_data,
    expected_answer,
    explanation,
    is_published
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
