from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.sql import func
from .database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, nullable=True)
    owner_id = Column(Integer, nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    has_prior_data = Column(Boolean, default=False)
    workflow_preference = Column(String(50))
    status = Column(String(50), default='draft')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_seed = Column(Boolean, default=False)
from sqlalchemy import Numeric

class ProjectObjective(Base):
    __tablename__ = "project_objectives"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, index=True)
    parameter = Column(String(255), nullable=False)
    target_value = Column(Numeric(10, 4))
    direction = Column(String(50))
    weight = Column(Numeric(5, 2), default=1.0)

class ProjectConstraint(Base):
    __tablename__ = "project_constraints"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, index=True)
    constraint_type = Column(String(50))
    description = Column(Text)
    limit_value = Column(Numeric(10, 4))
    operator = Column(String(2))

class ProjectThread(Base):
    __tablename__ = "project_threads"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, index=True)
    parent_thread_id = Column(Integer, nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default='active')
    is_seed = Column(Boolean, default=False)

from sqlalchemy.dialects.postgresql import JSONB

class FormulationVersion(Base):
    __tablename__ = "formulation_versions"
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, index=True)
    version_number = Column(Integer, nullable=False)
    name = Column(String(255))
    status = Column(String(50), default='draft')
    is_seed = Column(Boolean, default=False)

class FormulationItem(Base):
    __tablename__ = "formulation_items"
    id = Column(Integer, primary_key=True, index=True)
    formulation_id = Column(Integer, index=True)
    material_id = Column(Integer, nullable=True)
    role = Column(String(100))
    function_purpose = Column(String(255))
    amount = Column(Numeric(10, 4))
    unit = Column(String(20))
    is_dependent = Column(Boolean, default=False)

class ProcedureBlock(Base):
    __tablename__ = "procedure_blocks"
    id = Column(Integer, primary_key=True, index=True)
    formulation_id = Column(Integer, index=True)
    step_order = Column(Integer, nullable=False)
    instruction = Column(Text, nullable=False)
    process_parameters = Column(JSONB)

class ThreadMergeEvent(Base):
    __tablename__ = "thread_merge_events"
    id = Column(Integer, primary_key=True, index=True)
    source_thread_id = Column(Integer, index=True)
    target_thread_id = Column(Integer, index=True)
    merged_by = Column(Integer, nullable=True)
    merge_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ExperimentPlan(Base):
    __tablename__ = "experiment_plans"
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, index=True)
    name = Column(String(255), nullable=False)
    design_type = Column(String(50))
    status = Column(String(50), default='draft')
    is_seed = Column(Boolean, default=False)
    statistical_summary = Column(JSONB)

class ExperimentRun(Base):
    __tablename__ = "experiment_runs"
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, index=True)
    run_number = Column(Integer, nullable=False)
    formulation_id = Column(Integer, nullable=True)
    status = Column(String(50), default='scheduled')

class ResponseDefinition(Base):
    __tablename__ = "response_definitions"
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, index=True)
    name = Column(String(255), nullable=False)
    unit = Column(String(50))
    type = Column(String(50))

class ExperimentResult(Base):
    __tablename__ = "experiment_results"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, index=True)
    response_id = Column(Integer, index=True)
    value = Column(Numeric(15, 6))

class RawMaterial(Base):
    __tablename__ = "raw_materials"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, nullable=True)
    name = Column(String(255), nullable=False)
    chemical_family = Column(String(100))
    supplier = Column(String(255))
    cost_per_unit = Column(Numeric(10, 4))
    currency = Column(String(10), default='USD')
    unit = Column(String(20))
    properties = Column(JSONB)
    is_seed = Column(Boolean, default=False)
