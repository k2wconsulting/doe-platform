# backend/app/services/next_steps.py

def generate_next_steps(audit_res: dict, exp_count: int) -> list:
    steps = []
    
    if not audit_res.get("is_valid"):
        steps.append("Fix missing constraint limits in intake before proceeding.")
        for warn in audit_res.get("warnings", []):
            steps.append(f"Audit Warning: {warn}")
            
    if exp_count == 0:
        steps.append("Use the Recommender to pick an experiment type, then generate a Protocol.")
    else:
        steps.append("Monitor running experiments and append results.")
        
    return steps
