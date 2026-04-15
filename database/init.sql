-- Users & Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    org_id INT REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50)
);

-- Projects & Problem Framing
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    org_id INT REFERENCES organizations(id),
    owner_id INT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    has_prior_data BOOLEAN DEFAULT FALSE,
    workflow_preference VARCHAR(50), -- 'ai_generated', 'user_defined'
    status VARCHAR(50) DEFAULT 'draft',
    is_seed BOOLEAN DEFAULT FALSE,
    slug VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_objectives (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    parameter VARCHAR(255) NOT NULL,
    target_value DECIMAL(10,4),
    direction VARCHAR(50), -- 'maximize', 'minimize', 'target'
    weight DECIMAL(5,2) DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS project_constraints (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    constraint_type VARCHAR(50), -- 'cost', 'material_limit', 'process_time'
    description TEXT,
    limit_value DECIMAL(10,4),
    operator VARCHAR(2) -- '<=', '>=', '=='
);

-- Threads & Branching
CREATE TABLE IF NOT EXISTS project_threads (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    parent_thread_id INT REFERENCES project_threads(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    is_seed BOOLEAN DEFAULT FALSE,
    slug VARCHAR(100),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS thread_merge_events (
    id SERIAL PRIMARY KEY,
    source_thread_id INT REFERENCES project_threads(id),
    target_thread_id INT REFERENCES project_threads(id),
    merged_by INT REFERENCES users(id),
    merge_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raw Materials Library
CREATE TABLE IF NOT EXISTS raw_materials (
    id SERIAL PRIMARY KEY,
    org_id INT REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    chemical_family VARCHAR(100),
    supplier VARCHAR(255),
    cost_per_unit DECIMAL(10,4),
    currency VARCHAR(10) DEFAULT 'USD',
    unit VARCHAR(20),
    properties JSONB,
    is_seed BOOLEAN DEFAULT FALSE,
    slug VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS upload_files (
    id SERIAL PRIMARY KEY,
    org_id INT REFERENCES organizations(id),
    uploaded_by INT REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_material_documents (
    id SERIAL PRIMARY KEY,
    material_id INT REFERENCES raw_materials(id) ON DELETE CASCADE,
    file_id INT REFERENCES upload_files(id) ON DELETE CASCADE,
    document_type VARCHAR(50) -- 'TDS', 'SDS', 'other'
);

CREATE TABLE IF NOT EXISTS raw_material_roles (
    id SERIAL PRIMARY KEY,
    material_id INT REFERENCES raw_materials(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL -- 'resin', 'solvent', 'additive'
);

-- Formulations
CREATE TABLE IF NOT EXISTS formulation_versions (
    id SERIAL PRIMARY KEY,
    thread_id INT REFERENCES project_threads(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    approval_state VARCHAR(50) DEFAULT 'pending',
    is_seed BOOLEAN DEFAULT FALSE,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS formulation_items (
    id SERIAL PRIMARY KEY,
    formulation_id INT REFERENCES formulation_versions(id) ON DELETE CASCADE,
    material_id INT REFERENCES raw_materials(id),
    role VARCHAR(100),
    function_purpose VARCHAR(255),
    amount DECIMAL(10,4),
    unit VARCHAR(20),
    is_dependent BOOLEAN DEFAULT FALSE, -- for "q.s. to 100%"
    dependent_on_group VARCHAR(100),
    sub_blend_id INT, -- self reference or blend reference could go here
    notes TEXT
);

CREATE TABLE IF NOT EXISTS procedure_blocks (
    id SERIAL PRIMARY KEY,
    formulation_id INT REFERENCES formulation_versions(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    instruction TEXT NOT NULL,
    process_parameters JSONB -- e.g. {"rpm": 1000, "temp_c": 50, "time_min": 30}
);

-- Experiments & DoE
CREATE TABLE IF NOT EXISTS experiment_plans (
    id SERIAL PRIMARY KEY,
    thread_id INT REFERENCES project_threads(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    design_type VARCHAR(50), -- 'mixture', 'process', 'hybrid'
    status VARCHAR(50) DEFAULT 'draft',
    is_seed BOOLEAN DEFAULT FALSE,
    statistical_summary JSONB,
    statistical_summary JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiment_runs (
    id SERIAL PRIMARY KEY,
    plan_id INT REFERENCES experiment_plans(id) ON DELETE CASCADE,
    run_number INT NOT NULL,
    formulation_id INT REFERENCES formulation_versions(id),
    status VARCHAR(50) DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS response_definitions (
    id SERIAL PRIMARY KEY,
    plan_id INT REFERENCES experiment_plans(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    type VARCHAR(50) -- 'continuous', 'categorical'
);

CREATE TABLE IF NOT EXISTS experiment_results (
    id SERIAL PRIMARY KEY,
    run_id INT REFERENCES experiment_runs(id) ON DELETE CASCADE,
    response_id INT REFERENCES response_definitions(id) ON DELETE CASCADE,
    value DECIMAL(15,6),
    recorded_by INT REFERENCES users(id),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI & Knowledge
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id SERIAL PRIMARY KEY,
    org_id INT REFERENCES organizations(id),
    file_id INT REFERENCES upload_files(id),
    title VARCHAR(255),
    category VARCHAR(50), -- 'textbook', 'research_paper', 'internal_report'
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INT REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding_id VARCHAR(255) -- Reference to external vector DB ID if needed
);

CREATE TABLE IF NOT EXISTS model_runs (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id),
    prompt_used TEXT,
    model_name VARCHAR(100),
    response TEXT,
    confidence_level DECIMAL(5,2),
    confidence_reason TEXT,
    assumptions JSONB,
    evidence_sources JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    model_run_id INT REFERENCES model_runs(id) ON DELETE CASCADE,
    type VARCHAR(50), -- 'next_run', 'troubleshoot', 'design'
    description TEXT,
    action_payload JSONB
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    org_id INT REFERENCES organizations(id),
    user_id INT REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    changes JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
