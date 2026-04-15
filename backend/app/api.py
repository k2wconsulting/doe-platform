from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from sqlalchemy.orm import Session
import os
import logging
from datetime import datetime

from . import schemas
from . import models
from .database import get_db

router = APIRouter()

# --- Projects ---

@router.post("/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).filter(models.Project.status != 'archived').all()

@router.get("/projects/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@router.patch("/projects/{project_id}", response_model=schemas.ProjectResponse)
def update_project(project_id: int, project: dict, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if "name" in project: db_project.name = project["name"]
    if "description" in project: db_project.description = project["description"]
    if "status" in project: db_project.status = project["status"]
        
    db.commit()
    db.refresh(db_project)
    return db_project

# --- Project Intake ---

@router.post("/projects/{project_id}/intake")
def save_project_intake(project_id: int, payload: schemas.ProjectIntakePayload, db: Session = Depends(get_db)):
    db.query(models.ProjectObjective).filter(models.ProjectObjective.project_id == project_id).delete()
    db.query(models.ProjectConstraint).filter(models.ProjectConstraint.project_id == project_id).delete()
    
    for obj in payload.objectives:
        db_obj = models.ProjectObjective(project_id=project_id, **obj.dict())
        db.add(db_obj)
        
    for con in payload.constraints:
        db_con = models.ProjectConstraint(project_id=project_id, **con.dict())
        db.add(db_con)
    
    db.commit()
    return {"status": "success", "project_id": project_id}

@router.get("/projects/{project_id}/intake", response_model=schemas.ProjectIntakeResponse)
def get_project_intake(project_id: int, db: Session = Depends(get_db)):
    objectives = db.query(models.ProjectObjective).filter(models.ProjectObjective.project_id == project_id).all()
    constraints = db.query(models.ProjectConstraint).filter(models.ProjectConstraint.project_id == project_id).all()
    return {
        "project_id": project_id,
        "objectives": objectives,
        "constraints": constraints
    }

# --- Threads ---

@router.post("/projects/{project_id}/threads", response_model=schemas.ThreadResponse)
def create_thread(project_id: int, thread: schemas.ThreadCreate, db: Session = Depends(get_db)):
    db_thread = models.ProjectThread(project_id=project_id, **thread.dict())
    db.add(db_thread)
    db.commit()
    db.refresh(db_thread)
    return db_thread

@router.get("/projects/{project_id}/threads", response_model=List[schemas.ThreadResponse])
def get_threads(project_id: int, db: Session = Depends(get_db)):
    return db.query(models.ProjectThread).filter(models.ProjectThread.project_id == project_id, models.ProjectThread.status != 'archived').all()

@router.post("/threads/{thread_id}/merge")
def merge_thread(thread_id: int, merge: schemas.ThreadMerge, db: Session = Depends(get_db)):
    db_thread = db.query(models.ProjectThread).filter(models.ProjectThread.id == thread_id).first()
    if not db_thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    db_event = models.ThreadMergeEvent(
        source_thread_id=thread_id,
        target_thread_id=merge.target_thread_id,
        merge_notes=merge.merge_notes
    )
    db_thread.status = 'merged'
    db.add(db_event)
    db.commit()
    db.refresh(db_thread)
    return {"status": "success", "merged_into": merge.target_thread_id, "event_id": db_event.id}

@router.patch("/threads/{thread_id}")
def update_thread(thread_id: int, payload: dict, db: Session = Depends(get_db)):
    db_thread = db.query(models.ProjectThread).filter(models.ProjectThread.id == thread_id).first()
    if not db_thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    if "name" in payload: db_thread.name = payload["name"]
    if "status" in payload: db_thread.status = payload["status"]
        
    db.commit()
    db.refresh(db_thread)
    return db_thread

# --- Formulations ---

@router.post("/projects/{project_id}/formulations", response_model=schemas.FormulationResponse)
def create_formulation(project_id: int, form: schemas.FormulationCreate, db: Session = Depends(get_db)):
    thread = db.query(models.ProjectThread).filter(models.ProjectThread.project_id == project_id).first()
    if not thread:
        thread = models.ProjectThread(project_id=project_id, name="Default Thread")
        db.add(thread)
        db.commit()
        db.refresh(thread)
        
    version_count = db.query(models.FormulationVersion).filter(models.FormulationVersion.thread_id == thread.id).count()
    
    db_form = models.FormulationVersion(
        thread_id=thread.id,
        name=form.name,
        version_number=version_count + 1
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    
    for item in form.items:
        db_item = models.FormulationItem(formulation_id=db_form.id, **item.dict())
        db.add(db_item)
    
    for proc in form.procedures:
        db_proc = models.ProcedureBlock(formulation_id=db_form.id, **proc.dict())
        db.add(db_proc)
        
    db.commit()
    return get_formulation(db_form.id, db=db)

@router.get("/projects/{project_id}/formulations")
def get_formulations(project_id: int, db: Session = Depends(get_db)):
    thread = db.query(models.ProjectThread).filter(models.ProjectThread.project_id == project_id).first()
    if not thread:
        return []
    
    versions = db.query(models.FormulationVersion).filter(
        models.FormulationVersion.thread_id == thread.id, 
        models.FormulationVersion.status != 'archived'
    ).all()
    
    # Manually populate nested data for list view
    detailed_versions = []
    for v in versions:
        items = db.query(models.FormulationItem).filter(models.FormulationItem.formulation_id == v.id).all()
        procedures = db.query(models.ProcedureBlock).filter(models.ProcedureBlock.formulation_id == v.id).all()
        detailed_versions.append({
            "id": v.id,
            "thread_id": v.thread_id,
            "version_number": v.version_number,
            "name": v.name,
            "status": v.status,
            "items": items,
            "procedures": procedures
        })
    
    return detailed_versions

@router.get("/formulations/{form_id}", response_model=schemas.FormulationResponse)
def get_formulation(form_id: int, db: Session = Depends(get_db)):
    db_form = db.query(models.FormulationVersion).filter(models.FormulationVersion.id == form_id).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Formulation not found")
        
    items = db.query(models.FormulationItem).filter(models.FormulationItem.formulation_id == form_id).all()
    procedures = db.query(models.ProcedureBlock).filter(models.ProcedureBlock.formulation_id == form_id).all()
    
    return {
        "id": db_form.id,
        "thread_id": db_form.thread_id,
        "version_number": db_form.version_number,
        "name": db_form.name,
        "status": db_form.status,
        "items": items,
        "procedures": procedures
    }

def is_formulation_in_use(form_id: int, db: Session) -> bool:
    """Check if a formulation is linked to any experiment runs."""
    count = db.query(models.ExperimentRun).filter(models.ExperimentRun.formulation_id == form_id).count()
    return count > 0

@router.patch("/formulations/{form_id}")
def update_formulation(form_id: int, payload: dict, db: Session = Depends(get_db)):
    db_form = db.query(models.FormulationVersion).filter(models.FormulationVersion.id == form_id).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Formulation not found")
        
    # Safety Check: If items/procedures are being updated, ensure it's a draft and not in use
    if "items" in payload or "procedures" in payload:
        if db_form.status != 'draft':
            raise HTTPException(status_code=400, detail="Only draft formulations can be edited directly. Please clone to editized versions.")
        if is_formulation_in_use(form_id, db):
            raise HTTPException(status_code=400, detail="This formulation is already linked to experiment runs and cannot be edited. Please clone it instead.")

    if "status" in payload: 
        db_form.status = payload["status"]
    
    if "name" in payload:
        db_form.name = payload["name"]

    if "items" in payload:
        # Delete old items and insert new ones
        db.query(models.FormulationItem).filter(models.FormulationItem.formulation_id == form_id).delete()
        for item in payload["items"]:
            db_item = models.FormulationItem(formulation_id=form_id, **item)
            db.add(db_item)

    if "procedures" in payload:
        # Delete old procedures and insert new ones
        db.query(models.ProcedureBlock).filter(models.ProcedureBlock.formulation_id == form_id).delete()
        for proc in payload["procedures"]:
            db_proc = models.ProcedureBlock(formulation_id=form_id, **proc)
            db.add(db_proc)

    db.commit()
    return get_formulation(db_form.id, db=db)

@router.post("/formulations/{form_id}/clone", response_model=schemas.FormulationResponse)
def clone_formulation(form_id: int, db: Session = Depends(get_db)):
    db_form = db.query(models.FormulationVersion).filter(models.FormulationVersion.id == form_id).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Formulation not found")

    version_count = db.query(models.FormulationVersion).filter(models.FormulationVersion.thread_id == db_form.thread_id).count()
    
    new_form = models.FormulationVersion(
        thread_id=db_form.thread_id,
        name=f"{db_form.name} (Clone)",
        version_number=version_count + 1,
        status='draft'
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    
    # Clone items
    items = db.query(models.FormulationItem).filter(models.FormulationItem.formulation_id == form_id).all()
    for item in items:
        new_item = models.FormulationItem(
            formulation_id=new_form.id,
            material_id=item.material_id,
            role=item.role,
            function_purpose=item.function_purpose,
            amount=item.amount,
            unit=item.unit,
            is_dependent=item.is_dependent
        )
        db.add(new_item)
        
    # Clone procedures
    procs = db.query(models.ProcedureBlock).filter(models.ProcedureBlock.formulation_id == form_id).all()
    for proc in procs:
        new_proc = models.ProcedureBlock(
            formulation_id=new_form.id,
            step_order=proc.step_order,
            instruction=proc.instruction,
            process_parameters=proc.process_parameters
        )
        db.add(new_proc)
        
    db.commit()
    return get_formulation(new_form.id, db=db)

# --- Experiments ---

@router.post("/projects/{project_id}/experiments")
def create_experiment(project_id: int, payload: dict, db: Session = Depends(get_db)):
    thread = db.query(models.ProjectThread).filter(models.ProjectThread.project_id == project_id).first()
    plan = models.ExperimentPlan(
        thread_id=thread.id,
        name=payload.get("name", "Default Exp"),
        design_type=payload.get("design_type", "mixture")
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    responses = payload.get("responses", [])
    for r in responses:
        db_resp = models.ResponseDefinition(
            plan_id=plan.id,
            name=r.get("name"),
            unit=r.get("unit"),
            type=r.get("type", "continuous")
        )
        db.add(db_resp)
    db.commit()
    
    return {"id": plan.id, "project_id": project_id, "thread_id": thread.id, "name": plan.name}

@router.post("/experiments/{experiment_id}/runs")
def create_run(experiment_id: int, payload: dict, db: Session = Depends(get_db)):
    run_count = db.query(models.ExperimentRun).filter(models.ExperimentRun.plan_id == experiment_id).count()
    run = models.ExperimentRun(
        plan_id=experiment_id,
        run_number=run_count + 1,
        formulation_id=payload.get("formulation_id"),
        status=payload.get("status", "completed")
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return {"run_id": run.id, "plan_id": experiment_id, "run_number": run.run_number}

@router.post("/experiments/{experiment_id}/results")
def submit_result(experiment_id: int, payload: dict, db: Session = Depends(get_db)):
    run_id = payload.get("run_id")
    response_id = payload.get("response_id")
    value = payload.get("value")
    
    res = models.ExperimentResult(
        run_id=run_id,
        response_id=response_id,
        value=value
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return {"status": "success", "result_id": res.id}

@router.get("/projects/{project_id}/experiments")
def get_experiments(project_id: int, db: Session = Depends(get_db)):
    thread = db.query(models.ProjectThread).filter(models.ProjectThread.project_id == project_id).first()
    if not thread:
        return []
    plans = db.query(models.ExperimentPlan).filter(models.ExperimentPlan.thread_id == thread.id).all()
    
    result = []
    for plan in plans:
        runs = db.query(models.ExperimentRun).filter(models.ExperimentRun.plan_id == plan.id).all()
        run_data = []
        for r in runs:
            results = db.query(models.ExperimentResult).filter(models.ExperimentResult.run_id == r.id).all()
            run_data.append({
                "id": r.id, 
                "run_number": r.run_number, 
                "formulation_id": r.formulation_id,
                "status": r.status,
                "results": [{"id": res.id, "response_id": res.response_id, "value": res.value} for res in results]
            })
            
        responses = db.query(models.ResponseDefinition).filter(models.ResponseDefinition.plan_id == plan.id).all()
            
        result.append({
            "id": plan.id,
            "name": plan.name,
            "status": plan.status,
            "design_type": plan.design_type,
            "responses": [{"id": resp.id, "name": resp.name, "unit": resp.unit} for resp in responses],
            "runs": run_data
        })
    return result

@router.post("/experiments/{experiment_id}/new-iteration")
def recreate_experiment_iteration(experiment_id: int, db: Session = Depends(get_db)):
    db_plan = db.query(models.ExperimentPlan).filter(models.ExperimentPlan.id == experiment_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Experiment Plan not found")
        
    new_plan = models.ExperimentPlan(
        thread_id=db_plan.thread_id,
        name=f"{db_plan.name} (Iteration)",
        design_type=db_plan.design_type
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    
    responses = db.query(models.ResponseDefinition).filter(models.ResponseDefinition.plan_id == experiment_id).all()
    for r in responses:
        db_resp = models.ResponseDefinition(
            plan_id=new_plan.id,
            name=r.name,
            unit=r.unit,
            type=r.type
        )
        db.add(db_resp)
        
    db.commit()
    # Implicitly archive the old iteration if we wanted, but we will leave it
    return {"id": new_plan.id, "project_id": 0, "thread_id": new_plan.thread_id, "name": new_plan.name, "status": new_plan.status}

@router.delete("/experiments/{experiment_id}/results")
def clear_experiment_results(experiment_id: int, db: Session = Depends(get_db)):
    db_plan = db.query(models.ExperimentPlan).filter(models.ExperimentPlan.id == experiment_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Experiment Plan not found")
    
    if db_plan.status != 'draft':
        raise HTTPException(status_code=400, detail="Only draft experiments can have their results cleared. For running/completed experiments, please create a new iteration.")

    # Get all runs for this plan
    runs = db.query(models.ExperimentRun).filter(models.ExperimentRun.plan_id == experiment_id).all()
    run_ids = [r.id for r in runs]
    
    # Delete results for these runs
    db.query(models.ExperimentResult).filter(models.ExperimentResult.run_id.in_(run_ids)).delete(synchronize_session=False)
    
    # Optional: Reset run status to scheduled
    for r in runs:
        r.status = 'scheduled'
        
    db.commit()
    return {"status": "success", "message": "Results cleared and runs reset to scheduled."}

@router.patch("/experiments/{experiment_id}")
def update_experiment_status(experiment_id: int, payload: dict, db: Session = Depends(get_db)):
    db_plan = db.query(models.ExperimentPlan).filter(models.ExperimentPlan.id == experiment_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Experiment Plan not found")
    
    if "status" in payload:
        db_plan.status = payload["status"]
    if "name" in payload:
        db_plan.name = payload["name"]
        
    db.commit()
    return {"id": experiment_id, "status": db_plan.status}

# --- Knowledge Library ---

@router.post("/library/uploads")
def upload_document():
    return {"file_id": 1}

@router.get("/library/documents")
def get_documents():
    return []

@router.get("/library/documents/{doc_id}")
def get_document(doc_id: int):
    return {"id": doc_id}

# --- Domain Services ---

from .services.problem_classifier import classify_problem
from .services.constraint_auditor import audit_constraints
from .services.design_recommender import recommend_design
from .services.experiment_summary import summarize_results
from .services.next_steps import generate_next_steps

@router.post("/projects/{project_id}/classify-problem")
def api_classify_problem(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(404, "Project not found")
    
    # Grab intake
    obj = db.query(models.ProjectObjective).filter(models.ProjectObjective.project_id == project_id).all()
    con = db.query(models.ProjectConstraint).filter(models.ProjectConstraint.project_id == project_id).all()
    intake = {
        "objectives": [{"parameter": o.parameter, "target_value": o.target_value, "direction": o.direction} for o in obj],
        "constraints": [{"constraint_type": c.constraint_type, "limit_value": c.limit_value} for c in con]
    }
    
    return classify_problem(db_project, intake)

@router.post("/projects/{project_id}/audit-constraints")
def api_audit_constraints(project_id: int, db: Session = Depends(get_db)):
    con = db.query(models.ProjectConstraint).filter(models.ProjectConstraint.project_id == project_id).all()
    intake = {"constraints": [{"constraint_type": c.constraint_type, "limit_value": c.limit_value} for c in con]}
    
    thread = db.query(models.ProjectThread).filter(models.ProjectThread.project_id == project_id).first()
    formulations = []
    if thread:
        formulations = db.query(models.FormulationVersion).filter(models.FormulationVersion.thread_id == thread.id).all()
    
    return audit_constraints(intake, formulations)

@router.post("/projects/{project_id}/recommend-design")
def api_recommend_design(project_id: int, db: Session = Depends(get_db)):
    class_res = api_classify_problem(project_id, db)
    thread = db.query(models.ProjectThread).filter(models.ProjectThread.project_id == project_id).first()
    formulations = []
    if thread:
        formulations = db.query(models.FormulationVersion).filter(models.FormulationVersion.thread_id == thread.id).all()
        
    return recommend_design(class_res, len(formulations))

@router.get("/projects/{project_id}/result-summary")
def api_result_summary(project_id: int, db: Session = Depends(get_db)):
    experiments = get_experiments(project_id, db)
    if not experiments:
        return {"summary": "No experiments to summarize."}
    return summarize_results(experiments[0])

@router.get("/projects/{project_id}/next-steps")
def api_next_steps(project_id: int, db: Session = Depends(get_db)):
    audit = api_audit_constraints(project_id, db)
    exps = get_experiments(project_id, db)
    return {"steps": generate_next_steps(audit, len(exps))}

@router.post("/admin/reset")
def reset_uat_data(
    x_uat_secret: Optional[str] = Header(None), 
    db: Session = Depends(get_db)
):
    """
    UAT-only endpoint to wipe user-generated data and restore environment to seed state.
    Requires APP_ENV='uat' and a valid x-uat-secret header.
    """
    APP_ENV = os.getenv("APP_ENV", "development")
    UAT_SECRET = os.getenv("UAT_SECRET")

    if APP_ENV != "uat":
        raise HTTPException(status_code=403, detail="Reset only permitted in UAT environment")
    
    if not UAT_SECRET or x_uat_secret != UAT_SECRET:
        logging.warning(f"UNAUTHORIZED RESET ATTEMPT: {datetime.now()}")
        raise HTTPException(status_code=401, detail="Invalid UAT secret")

    logging.info(f"--- DATABASE RESET INITIATED: {datetime.now()} ---")

    try:
        # FK-safe deletion order for user-generated data (is_seed = False)
        # 1. Results and Runs
        db.query(models.ExperimentResult).filter(
            models.ExperimentResult.run_id.in_(
                db.query(models.ExperimentRun.id).join(models.ExperimentPlan).filter(models.ExperimentPlan.is_seed == False)
            )
        ).delete(synchronize_session=False)
        
        db.query(models.ExperimentRun).filter(
            models.ExperimentRun.plan_id.in_(
                db.query(models.ExperimentPlan.id).filter(models.ExperimentPlan.is_seed == False)
            )
        ).delete(synchronize_session=False)

        # 2. Plans and Definitions
        db.query(models.ResponseDefinition).filter(
            models.ResponseDefinition.plan_id.in_(
                db.query(models.ExperimentPlan.id).filter(models.ExperimentPlan.is_seed == False)
            )
        ).delete(synchronize_session=False)
        
        db.query(models.ExperimentPlan).filter(models.ExperimentPlan.is_seed == False).delete(synchronize_session=False)

        # 3. Formulations
        db.query(models.ProcedureBlock).filter(
            models.ProcedureBlock.formulation_id.in_(
                db.query(models.FormulationVersion.id).filter(models.FormulationVersion.is_seed == False)
            )
        ).delete(synchronize_session=False)
        
        db.query(models.FormulationItem).filter(
            models.FormulationItem.formulation_id.in_(
                db.query(models.FormulationVersion.id).filter(models.FormulationVersion.is_seed == False)
            )
        ).delete(synchronize_session=False)
        
        db.query(models.FormulationVersion).filter(models.FormulationVersion.is_seed == False).delete(synchronize_session=False)

        # 4. Threads and Merges
        db.query(models.ThreadMergeEvent).delete(synchronize_session=False) # All merges are considered non-seed for now
        db.query(models.ProjectThread).filter(models.ProjectThread.is_seed == False).delete(synchronize_session=False)

        # 5. Intake and Projects
        db.query(models.ProjectObjective).filter(
            models.ProjectObjective.project_id.in_(
                db.query(models.Project.id).filter(models.Project.is_seed == False)
            )
        ).delete(synchronize_session=False)
        
        db.query(models.ProjectConstraint).filter(
            models.ProjectConstraint.project_id.in_(
                db.query(models.Project.id).filter(models.Project.is_seed == False)
            )
        ).delete(synchronize_session=False)
        
        db.query(models.Project).filter(models.Project.is_seed == False).delete(synchronize_session=False)
        
        # 6. Raw Materials (Optional: Reset non-seed materials)
        db.query(models.RawMaterial).filter(models.RawMaterial.is_seed == False).delete(synchronize_session=False)

        db.commit()
        logging.info("--- DATABASE RESET SUCCESSFUL ---")
        return {"status": "success", "message": "All user-generated data has been cleared. Seed data preserved."}
    
    except Exception as e:
        db.rollback()
        logging.error(f"DATABASE RESET FAILED: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during reset")
