-- UAT SEED DATA
-- Idempotent script to populate the review environment with sample data.

-- 1. Organizations
INSERT INTO organizations (id, name) 
VALUES (1, 'UAT Review Corp')
ON CONFLICT (id) DO NOTHING;

-- 2. Raw Materials (Stable Slugs for Idempotency)
INSERT INTO raw_materials (id, name, chemical_family, supplier, cost_per_unit, unit, is_seed, slug)
VALUES 
(1, 'Resin Alpha-100', 'Epoxy', 'ChemCorp', 12.50, 'kg', TRUE, 'resin-alpha-100'),
(2, 'Solvent X-Ray', 'Acetone', 'SolvDist', 4.25, 'L', TRUE, 'solvent-x-ray'),
(3, 'Additive Smooth-99', 'Silicone', 'NanoSpec', 85.00, 'kg', TRUE, 'additive-smooth-99')
ON CONFLICT (slug) DO NOTHING;

-- 3. Projects
INSERT INTO projects (id, name, description, status, is_seed, slug)
VALUES 
(1, 'Demo: NextGen Coating', 'Sample project for business review of the DoE workflow.', 'draft', TRUE, 'demo-nextgen-coating')
ON CONFLICT (slug) DO NOTHING;

-- 4. Default Threads
INSERT INTO project_threads (id, project_id, name, description, is_seed, slug)
VALUES 
(1, 1, 'Main Research Line', 'Primary branch for formulation development.', TRUE, 'demo-main-thread')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Formulation
INSERT INTO formulation_versions (id, thread_id, version_number, name, status, is_seed)
VALUES 
(1, 1, 1, 'Standard Base v1', 'draft', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Formulation Items
INSERT INTO formulation_items (formulation_id, material_id, role, amount, unit)
VALUES 
(1, 1, 'Resin', 60.0, '%'),
(1, 2, 'Solvent', 35.0, '%'),
(1, 3, 'Additive', 5.0, '%')
ON CONFLICT DO NOTHING;

-- 7. Seed Experiment
INSERT INTO experiment_plans (id, thread_id, name, design_type, status, is_seed)
VALUES 
(1, 1, 'Baseline Mixture Study', 'mixture', 'draft', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Responses
INSERT INTO response_definitions (id, plan_id, name, unit, type)
VALUES 
(1, 1, 'Viscosity', 'cP', 'continuous'),
(2, 1, 'Drying Time', 'min', 'continuous')
ON CONFLICT (id) DO NOTHING;
