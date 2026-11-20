from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.schemas import MLPredictRequest, MLPredictResponse, MLMetricsResponse
from backend.app.services.ml_service import ml_service
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.post("/predict", response_model=MLPredictResponse)
def predict_department(payload: MLPredictRequest, current_user = Depends(get_current_user)):
    """Predict ticket department from text using the trained TF-IDF + Logistic Regression model."""
    res = ml_service.predict(payload.text)
    return res

@router.get("/metrics", response_model=MLMetricsResponse)
def get_ml_metrics(current_user = Depends(get_current_user)):
    """Retrieve verified evaluation metrics, accuracy, and confusion matrix of the trained ML model."""
    metrics = ml_service.get_metrics()
    if not metrics:
        raise HTTPException(
            status_code=404,
            detail="ML evaluation metrics not found. Please run the training script."
        )
    return metrics
