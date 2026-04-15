# backend/app/services/experiment_summary.py

def summarize_results(experiment: dict) -> dict:
    runs = experiment.get("runs", [])
    completed_runs = [r for r in runs if r.get("status") == "completed"]
    
    if not completed_runs:
        return {"summary": "No completed runs found to summarize."}
        
    responses = experiment.get("responses", [])
    stats = {}
    
    for resp in responses:
        rid = resp["id"]
        vals = []
        for run in completed_runs:
            for res in run.get("results", []):
                if res["response_id"] == rid:
                    vals.append(res["value"])
        if vals:
            stats[resp["name"]] = {
                "min": min(vals),
                "max": max(vals),
                "avg": sum(vals) / len(vals),
                "count": len(vals)
            }
            
    return {
        "total_runs": len(runs),
        "completed_runs": len(completed_runs),
        "response_stats": stats,
        "summary": f"Calculated range stats across {len(completed_runs)} completed runs."
    }
