# backend/app/services/design_recommender.py

def recommend_design(classification: dict, formulation_count: int) -> dict:
    c_type = classification.get("problem_type", "screening")
    
    recommendation = "Full Factorial"
    cautions = []
    
    if c_type == "screening":
        recommendation = "Plackett-Burman or Fractional Factorial"
        cautions.append("Only use screening to identify main effects. Interactions will be confounded.")
    elif c_type == "mixture":
        recommendation = "Simplex Centroid"
        cautions.append("Ensure component bounds do not create impossible mixture constraints.")
    elif c_type == "hybrid":
        recommendation = "D-Optimal Custom Design"
        cautions.append("High run count expected. Consider reducing factors.")
        
    if formulation_count == 0:
        cautions.append("No base formulation exists. Create one to enable specific bound generation.")

    return {
        "recommended_design": recommendation,
        "rationale": f"Based on '{c_type}' classification constraints.",
        "cautions": cautions
    }
