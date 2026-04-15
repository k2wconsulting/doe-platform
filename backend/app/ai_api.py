from fastapi import APIRouter
from . import schemas

router = APIRouter()

# --- AI Assistance Endpoints ---

@router.post("/projects/{project_id}/ai/problem-frame", response_model=schemas.BaseAIResponse)
def ai_problem_frame(project_id: int, request: schemas.AIProblemFrameRequest):
    return {
        "answer": "Suggested variables for optimization: Resin, Catalyst, Curing Time.",
        "confidence_level": 0.85,
        "confidence_reason": "High historical overlap with polyurethane optimizations.",
        "assumptions": ["Assuming standard atmospheric pressure during cure."],
        "caution_points": ["Catalyst over 5% may cause exothermic runaway."],
        "evidence_sources": [{"source": "Textbook X, p 45"}, {"source": "Exp Run 432"}],
        "recommended_next_steps": ["Confirm catalyst bounds", "Create initial design matrix"]
    }

@router.post("/projects/{project_id}/ai/design-recommendation", response_model=schemas.BaseAIResponse)
def ai_design_recommendation(project_id: int, payload: dict):
    return {
        "answer": {"type": "mixture-process", "runs": 15, "description": "D-optimal nested design"},
        "confidence_level": 0.90,
        "confidence_reason": "Deterministic selection based on 3 mixture components + 1 process factor.",
        "assumptions": [],
        "caution_points": [],
        "evidence_sources": [],
        "recommended_next_steps": []
    }

@router.post("/projects/{project_id}/ai/formulation-suggestion", response_model=schemas.BaseAIResponse)
def ai_formulation_suggestion(project_id: int, payload: dict):
    return {
        "answer": {"items": [{"name": "Resin X", "amount": 60}], "note": "Placeholder"},
        "confidence_level": 0.8,
        "confidence_reason": "Vector match",
        "assumptions": [],
        "caution_points": [],
        "evidence_sources": [],
        "recommended_next_steps": []
    }

@router.post("/projects/{project_id}/ai/result-explainer", response_model=schemas.BaseAIResponse)
def ai_result_explainer(project_id: int, payload: dict):
    return {
        "answer": "Interaction between Component A and Temp is highly significant (p < 0.05).",
        "confidence_level": 0.95,
        "confidence_reason": "ANOVA calculation",
        "assumptions": ["Residuals are normal"],
        "caution_points": [],
        "evidence_sources": [],
        "recommended_next_steps": []
    }

@router.post("/projects/{project_id}/ai/troubleshoot", response_model=schemas.BaseAIResponse)
def ai_troubleshoot(project_id: int, payload: dict):
    return {
        "answer": "Viscosity drop is likely due to solvent evaporation prior to curing.",
        "confidence_level": 0.75,
        "confidence_reason": "Literature correlation with MEK solvent.",
        "assumptions": ["Seals were not 100% tight during storage."],
        "caution_points": ["Check mass balances before running again."],
        "evidence_sources": [],
        "recommended_next_steps": []
    }
