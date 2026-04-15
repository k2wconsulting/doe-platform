# backend/tests/test_services.py
from app.services.problem_classifier import classify_problem
from app.services.design_recommender import recommend_design

class DummyProject:
    pass

def test_problem_classifier():
    intake = {
        "objectives": [{"parameter": "viscosity"}, {"parameter": "yield"}]
    }
    res = classify_problem(DummyProject(), intake)
    assert res["problem_type"] == "hybrid"

def test_design_recommender():
    res = recommend_design({"problem_type": "mixture"}, 1)
    assert res["recommended_design"] == "Simplex Centroid"
