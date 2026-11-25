from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

MODEL_PATH = Path(__file__).resolve().parent / "models" / "learning_readiness.pkl"

# Harus sama persis dengan FEATURES di train_readiness.py
FEATURES = [
    "prior_avg_score",
    "prior_score_trend",
    "prior_attempts",
    "study_duration_minutes",
    "activity_frequency",
    "completion_rate",
]

app = FastAPI(title="Learning Readiness API")
model = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None


class ReadinessInput(BaseModel):
    prior_avg_score: float = Field(ge=0, le=100)
    prior_score_trend: float
    prior_attempts: int = Field(ge=0)
    study_duration_minutes: float = Field(ge=0)
    activity_frequency: int = Field(ge=0)
    completion_rate: float = Field(ge=0, le=100)


def to_level(score: float) -> str:
    # Nilai enum sama dengan kolom readiness_predictions.readiness_level
    # dan yang dipakai LearnerQuizResultController.
    if score < 0.5:
        return "belum_siap"
    if score < 0.75:
        return "cukup_siap"
    return "siap"


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict/readiness")
def predict(data: ReadinessInput):
    if model is None:
        raise HTTPException(503, "Model belum ada. Jalankan train_readiness.py dulu.")

    X = pd.DataFrame([data.model_dump()], columns=FEATURES)
    score = float(model.predict_proba(X)[0][list(model.classes_).index(1)])

    return {
        "readiness_score": round(score, 5),   # 0-1 -> readiness_predictions.readiness_score
        "readiness_level": to_level(score),
        "model_version": "rf-v1",
        "features": data.model_dump(),        # -> kolom JSON `features`
    }