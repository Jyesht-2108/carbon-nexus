import pandas as pd
import numpy as np
from typing import List
from src.utils.config import settings
from src.utils.logger import logger


class OutlierDetector:
    """Detects outliers in numerical data"""
    
    @staticmethod
    def detect_outliers_iqr(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        """
        Detect outliers using IQR method
        Adds 'is_outlier' column to DataFrame
        """
        df = df.copy()
        df["is_outlier"] = False
        
        for col in columns:
            if col not in df.columns:
                continue
            
            # Skip if column has no numeric data
            numeric_data = pd.to_numeric(df[col], errors="coerce")
            if numeric_data.isna().all():
                continue
            
            Q1 = numeric_data.quantile(0.25)
            Q3 = numeric_data.quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - settings.iqr_multiplier * IQR
            upper_bound = Q3 + settings.iqr_multiplier * IQR
            
            outliers = (numeric_data < lower_bound) | (numeric_data > upper_bound)
            df.loc[outliers, "is_outlier"] = True
        
        outlier_count = df["is_outlier"].sum()
        logger.info(f"Detected {outlier_count} outliers using IQR method")
        
        return df
    
    @staticmethod
    def detect_outliers_zscore(df: pd.DataFrame, columns: List[str], threshold: float = 3.0) -> pd.DataFrame:
        """
        Detect outliers using Z-score method
        """
        df = df.copy()
        df["is_outlier"] = False
        
        for col in columns:
            if col not in df.columns:
                continue
            
            numeric_data = pd.to_numeric(df[col], errors="coerce")
            if numeric_data.isna().all():
                continue
            
            mean = numeric_data.mean()
            std = numeric_data.std()
            
            if std == 0:
                continue
            
            z_scores = np.abs((numeric_data - mean) / std)
            outliers = z_scores > threshold
            df.loc[outliers, "is_outlier"] = True
        
        outlier_count = df["is_outlier"].sum()
        logger.info(f"Detected {outlier_count} outliers using Z-score method")
        
        return df
    
    @staticmethod
    def flag_outliers(df: pd.DataFrame) -> pd.DataFrame:
        """
        Main method to flag outliers based on configuration
        """
        numeric_columns = ["distance_km", "load_kg", "energy_kwh", "speed"]
        
        if settings.outlier_method == "iqr":
            return OutlierDetector.detect_outliers_iqr(df, numeric_columns)
        elif settings.outlier_method == "zscore":
            return OutlierDetector.detect_outliers_zscore(df, numeric_columns)
        else:
            logger.warning(f"Unknown outlier method: {settings.outlier_method}, defaulting to IQR")
            return OutlierDetector.detect_outliers_iqr(df, numeric_columns)
