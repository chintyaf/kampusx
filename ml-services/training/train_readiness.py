
from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score


# Directories
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
DATA_PATH = BASE_DIR / "dataset" / "learning_readiness.csv"

MODEL_DIR.mkdir(exist_ok=True)


# Load dataset
df = pd.read_csv(DATA_PATH)

FEATURES = [
    "quiz_score",
    "attempts",
    "study_duration",
    "completion_rate"
]

TARGET = "readiness"

X = df[FEATURES]
y = df[TARGET]


# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# Train Random Forest
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)


# Evaluation
y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))


# Save model
joblib.dump(
    model,
    MODEL_DIR / "learning_readiness.pkl"
)

print("Model saved successfully!")
