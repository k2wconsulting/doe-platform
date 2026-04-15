from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- General Models ---

class BaseAIResponse(BaseModel):
    answer: Any
    confidence_level: float = Field(..., ge=0, le=1.0)
    confidence_reason: str
    assumptions: List[str]
    caution_points: List[str]
    evidence_sources: List[Dict[str, str]]
    recommended_next_steps: List[str]


# --- Project Models ---

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    has_prior_data: bool = False
    workflow_preference: str = "ai_generated"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectObjectiveBase(BaseModel):
    parameter: str
    target_value: Optional[float] = None
    direction: Optional[str] = None
    weight: Optional[float] = 1.0

    class Config:
        from_attributes = True

class ProjectConstraintBase(BaseModel):
    constraint_type: Optional[str] = None
    description: Optional[str] = None
    limit_value: Optional[float] = None
    operator: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectIntakePayload(BaseModel):
    objectives: List[ProjectObjectiveBase]
    constraints: List[ProjectConstraintBase]

class ProjectIntakeResponse(ProjectIntakePayload):
    project_id: int

# --- Thread Models ---

class ThreadCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_thread_id: Optional[int] = None

class ThreadResponse(ThreadCreate):
    id: int
    project_id: int
    status: str

    class Config:
        from_attributes = True

class ThreadMerge(BaseModel):
    target_thread_id: int
    merge_notes: str

# --- Formulation Models ---

class FormulationItem(BaseModel):
    material_id: Optional[int] = None
    role: str
    function_purpose: Optional[str] = None
    amount: float
    unit: str
    is_dependent: bool = False
    
    class Config:
        from_attributes = True

class ProcedureBlock(BaseModel):
    step_order: int
    instruction: str
    process_parameters: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class FormulationCreate(BaseModel):
    name: str
    items: List[FormulationItem]
    procedures: List[ProcedureBlock]

class FormulationResponse(BaseModel):
    id: int
    thread_id: int
    version_number: int
    name: Optional[str] = None
    status: str
    items: List[FormulationItem]
    procedures: List[ProcedureBlock]

    class Config:
        from_attributes = True

# --- AI Assistance Models ---

class AIProblemFrameRequest(BaseModel):
    objective_description: str
    constraints: List[str]

# Other models omitted for brevity, but schemas will be used in routers.
