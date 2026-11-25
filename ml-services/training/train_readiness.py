from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent.parent  # naik ke ml-services/
MODEL_PATH = BASE_DIR / "models" / "learning_readiness.pkl"
MODEL_PATH.parent.mkdir(exist_ok=True)

# Urutan & nama fitur HARUS sama dengan main.py
FEATURES = [
    "prior_avg_score",       # rata-rata skor kuis sebelumnya (quiz_attempts)
    "prior_score_trend",     # selisih skor terakhir vs sebelumnya
    "prior_attempts",        # jumlah percobaan kuis sebelumnya
    "study_duration_minutes",  # total durasi belajar (learning_histories)
    "activity_frequency",    # jumlah aktivitas (learning_activities)
    "completion_rate",       # % lesson selesai (learning_histories)
]
PASSING_SCORE = 50  # untuk data simulasi; untuk data asli pakai quizzes.passing_score (mis. 70)


def make_synthetic_data(n=1000, seed=42):
    """DATA SIMULASI untuk coba-coba, bukan data mahasiswa asli."""
    rng = np.random.default_rng(seed)
    df = pd.DataFrame({
        "prior_avg_score": rng.uniform(30, 95, n),
        "prior_score_trend": rng.normal(0, 8, n),
        "prior_attempts": rng.integers(1, 6, n),
        "study_duration_minutes": rng.gamma(2.5, 20, n),
        "activity_frequency": rng.integers(1, 15, n),
        "completion_rate": rng.uniform(10, 100, n),
    })
    # Skor kuis target disimulasikan dari fitur + noise,
    # hanya untuk membuat label (TIDAK dipakai sebagai fitur).
    target_score = (
        0.55 * df["prior_avg_score"]
        + 0.20 * df["prior_score_trend"]
        + 0.15 * df["completion_rate"]
        + 0.10 * df["study_duration_minutes"].clip(0, 120) / 120 * 100
        + rng.normal(0, 12, n)
    ).clip(0, 100)
    df["readiness_label"] = (target_score >= PASSING_SCORE).astype(int)
    return df


df = make_synthetic_data()
# Kalau nanti pakai data asli:
# df = pd.read_csv("learning_readiness_data.csv")
# df["readiness_label"] = (df["target_quiz_score"] >= PASSING_SCORE).astype(int)

X, y = df[FEATURES], df["readiness_label"]
print("Distribusi label:\n", y.value_counts().sort_index())

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(
    n_estimators=200, min_samples_leaf=3, class_weight="balanced", random_state=42
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("\nAccuracy:", round(accuracy_score(y_test, y_pred), 4))
print(classification_report(y_test, y_pred, target_names=["Belum lulus", "Lulus"]))

print("Feature importance:")
for name, imp in sorted(zip(FEATURES, model.feature_importances_), key=lambda x: -x[1]):
    print(f"  {name:25s} {imp:.3f}")

joblib.dump(model, MODEL_PATH)
print(f"\nModel disimpan ke {MODEL_PATH}")