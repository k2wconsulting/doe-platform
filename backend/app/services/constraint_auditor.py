# backend/app/services/constraint_auditor.py

def audit_constraints(intake: dict, formulations: list) -> dict:
    warnings = []
    valid = True

    constraints = intake.get("constraints", [])
    if not constraints:
        warnings.append("No constraints defined contextually. Optimization may wander out of bounds.")
        valid = False
        
    for c in constraints:
        if c.get("limit_value") is None:
            warnings.append(f"Constraint '{c.get('constraint_type')}' is missing a limit boundary.")
            valid = False
            
    # Check bounds on formulations relative to QS logic
    for f in formulations:
        items = getattr(f, 'items', [])
        total_p = sum([i.amount for i in items if getattr(i, 'unit', '') == '%'])
        if total_p > 100:
            warnings.append(f"Formulation {getattr(f, 'name', f.id)} exceeds 100%.")
            valid = False

    return {
        "is_valid": valid,
        "warnings": warnings,
        "audited_count": len(constraints)
    }
