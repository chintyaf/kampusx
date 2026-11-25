
from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


# =====================================================
# CONFIGURATION
# =====================================================

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "learning_readiness.pkl"

FEATURE_COLUMNS = [
    "quiz_score",
    "attempts",
    "study_duration",
    "completion_rate"
]


# =====================================================
# FASTAPI
# =====================================================

app = FastAPI(
    title="Student Hub Space - Learning Readiness API",
    description="Machine Learning API for Learning Readiness Prediction",
    version="1.0.0"
)


# =====================================================
# LOAD MODEL
# =====================================================

learning_readiness_model = None

if MODEL_PATH.exists():
    learning_readiness_model = joblib.load(MODEL_PATH)
    print("[INFO] Learning Readiness model loaded successfully.")
else:
    print(f"[WARNING] Model file not found: {MODEL_PATH}")


# =====================================================
# REQUEST SCHEMA
# =====================================================

class LearningReadinessInput(BaseModel):
    quiz_score: float = Field(ge=0, le=100)
    attempts: int = Field(ge=0)
    study_duration: float = Field(ge=0)
    completion_rate: float = Field(ge=0, le=100)


# =====================================================
# ROOT ENDPOINT
# =====================================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Learning Readiness API is running"
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": learning_readiness_model is not None
    }


# =====================================================
# LEARNING READINESS PREDICTION
# =====================================================

@app.post("/predict/readiness")
def predict_readiness(data: LearningReadinessInput):

    if learning_readiness_model is None:
        raise HTTPException(
            status_code=503,
            detail="Learning Readiness model is not loaded."
        )

    try:
        # Prepare input data
        input_data = pd.DataFrame(
            [[
                data.quiz_score,
                data.attempts,
                data.study_duration,
                data.completion_rate
            ]],
            columns=FEATURE_COLUMNS
        )

        # Prediction
        prediction = learning_readiness_model.predict(input_data)

        predicted_class = prediction[0]

        result = {
            "prediction": str(predicted_class)
        }

        # Prediction probability
        if hasattr(learning_readiness_model, "predict_proba"):

            probabilities = learning_readiness_model.predict_proba(
                input_data
            )[0]

            result["probabilities"] = {
                str(label): round(float(probability), 4)
                for label, probability in zip(
                    learning_readiness_model.classes_,
                    probabilities
                )
            }

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
