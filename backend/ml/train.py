"""
WarpDrive Intelligent Service Desk - ML Training Pipeline
Trains a TF-IDF + Logistic Regression Classifier to route tickets into departments:
- IT Support
- Technical
- HR
- Accounts
- Maintenance
"""

import os
import json
import re
import csv
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix
)

# Text preprocessor function
def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    # Lowercase
    text = text.lower()
    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    # Remove non-alphanumeric (keep spaces and hyphens)
    text = re.sub(r"[^a-zA-Z0-9\s-]", " ", text)
    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

def train_pipeline():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "dataset.csv")
    artifacts_dir = os.path.join(base_dir, "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)

    print(f"Loading dataset from: {dataset_path}")
    texts = []
    labels = []

    with open(dataset_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cleaned = clean_text(row["text"])
            if cleaned and row["department"]:
                texts.append(cleaned)
                labels.append(row["department"].strip())

    classes = sorted(list(set(labels)))
    print(f"Total samples: {len(texts)}")
    print(f"Classes ({len(classes)}): {classes}")

    # Stratified Train/Test split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        texts,
        labels,
        test_size=0.20,
        random_state=42,
        stratify=labels
    )

    print(f"Training set: {len(X_train)} samples")
    print(f"Testing set: {len(X_test)} samples")

    # Vectorization with unigrams and bigrams
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True,
        stop_words="english",
        min_df=1
    )

    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Train Logistic Regression
    clf = LogisticRegression(
        C=2.0,
        max_iter=1000,
        class_weight="balanced",
        random_state=42
    )

    print("Fitting Logistic Regression classifier...")
    clf.fit(X_train_vec, y_train)

    # Evaluation on holdout test set
    y_pred = clf.predict(X_test_vec)
    y_prob = clf.predict_proba(X_test_vec)

    accuracy = float(accuracy_score(y_test, y_pred))
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro", zero_division=0)
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)
    
    report_dict = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    report_str = classification_report(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=classes).tolist()

    print("\n" + "="*50)
    print("MODEL EVALUATION RESULTS")
    print("="*50)
    print(f"Accuracy:          {accuracy * 100:.2f}%")
    print(f"Macro Precision:   {p_macro * 100:.2f}%")
    print(f"Macro Recall:      {r_macro * 100:.2f}%")
    print(f"Macro F1-Score:    {f1_macro * 100:.2f}%")
    print(f"Weighted F1-Score: {f1_weighted * 100:.2f}%")
    print("\nClassification Report:\n", report_str)
    print("Confusion Matrix:\n", np.array(cm))

    # Save artifacts
    model_file = os.path.join(artifacts_dir, "model.joblib")
    vec_file = os.path.join(artifacts_dir, "vectorizer.joblib")
    metrics_file = os.path.join(artifacts_dir, "metrics.json")

    joblib.dump(clf, model_file)
    joblib.dump(vectorizer, vec_file)

    metrics_payload = {
        "model_type": "TF-IDF + Logistic Regression",
        "sample_count": len(texts),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "classes": classes,
        "accuracy": round(accuracy, 4),
        "macro_precision": round(float(p_macro), 4),
        "macro_recall": round(float(r_macro), 4),
        "macro_f1": round(float(f1_macro), 4),
        "weighted_f1": round(float(f1_weighted), 4),
        "classification_report": report_dict,
        "confusion_matrix": cm,
        "parameters": {
            "ngram_range": [1, 2],
            "max_features": 5000,
            "C": 2.0,
            "class_weight": "balanced"
        }
    }

    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"\nArtifacts successfully saved to {artifacts_dir}:")
    print(f" - {model_file}")
    print(f" - {vec_file}")
    print(f" - {metrics_file}")
    return metrics_payload

if __name__ == "__main__":
    train_pipeline()
