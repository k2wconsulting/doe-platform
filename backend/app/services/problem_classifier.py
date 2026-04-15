# backend/app/services/problem_classifier.py
from app.models import Project

def classify_problem(project: Project, intake: dict) -> dict:
    """
    Deterministic classification of the experimental problem space.
    Rules:
    - If objectives include 'yield' or 'viscosity' -> Mixture / Process
    - If purely composition -> Mixture
    """
    obj_params = [obj.get("parameter", "").lower() for obj in intake.get("objectives", [])]
    
    rationale = []
    classification = "hybrid"
    
    if any(p in ["yield", "temp", "time", "pressure"] for p in obj_params):
        classification = "process"
        rationale.append("Detected process-specific parameters (e.g. time, temp, yield).")
    
    if any(p in ["viscosity", "density", "cost", "stability"] for p in obj_params):
        if classification == "process":
            classification = "hybrid"
            rationale.append("Detected both formulation properties and process factors. A Mixture-Process crossed design is recommended.")
        else:
            classification = "mixture"
            rationale.append("Parameters suggest pure formulation development.")
            
    if not rationale:
        rationale.append("No specific keywords matched. Defaulting to general screening.")
        classification = "screening"
        
    return {
        "problem_type": classification,
        "rationale": " ".join(rationale),
        "confidence_score": 0.85
    }
