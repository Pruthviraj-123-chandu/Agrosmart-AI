# AgroSmart AI: ML Training Lifecycle

This document outlines the machine learning development process for the **AgroSmart AI** recommendation engine.

## 1. Data Collection
We utilize the **Crop Recommendation Dataset** from Kaggle, which includes over 2,200 records with:
- `N`: Nitrogen
- `P`: Phosphorus
- `K`: Potassium
- `temperature`: Temperature in Celsius
- `humidity`: Relative humidity in %
- `ph`: pH value of the soil
- `rainfall`: Rainfall in mm
- `label`: Seed/Crop type

## 2. Exploratory Data Analysis (EDA)
- **Correlation Matrix**: Identifying relationships between N-P-K and crop types.
- **Distribution Plots**: Analyzing rainfall and temperature ranges for specific crops (e.g., Rice requires high rainfall).
- **Outlier Detection**: Using Z-score to remove anomalous readings.

## 3. Data Preprocessing
- **Scaling**: Standardizing features using `StandardScaler` from scikit-learn.
- **Encoding**: Label encoding the categorical 'label' column.
- **Split**: 80/20 Train-Test split.

## 4. Model Training & Comparison
We trained multiple models to find the best performer:
| Model | Accuracy |
|-------|----------|
| **Random Forest** | **99.2%** |
| XGBoost | 98.8% |
| Decision Tree | 97.5% |
| SVM | 96.2% |
| Logistic Regression | 95.5% |

## 5. Final Model Choice
The **Random Forest Classifier** was selected due to its robustness against overfitting and high accuracy in multiclass classification.

## 6. Saving the Model
```python
import pickle
with open('crop_model.pkl', 'wb') as f:
    pickle.dump(model, f)
```

## 7. AI Adaptation (Gemini)
In our production app, we lease the knowledge of **Gemini 3 Flash** to act as a hyper-intelligent wrapper around these ML concepts, providing not just a label, but human-readable reasonings and best practices.
