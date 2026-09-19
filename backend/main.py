from pathlib import Path

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.ensemble import IsolationForest

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

app = FastAPI(title="Safe Sphere Analysis API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["GET"], allow_headers=["*"])


@app.get("/health")
def health():
    return {"status": "operational", "service": "safe-sphere-analysis"}


@app.get("/analysis/oracle")
def oracle_analysis():
    file_path = DATA / "chainlink_tusd_usd_oracle_sample.csv"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Historical oracle source unavailable")
    frame = pd.read_csv(file_path, dtype={"roundId": str, "answer_raw": str})
    frame["price"] = pd.to_numeric(frame["answer_raw"]) / 100_000_000
    frame["rolling_mean"] = frame["price"].rolling(5, min_periods=3).mean()
    frame["rolling_std"] = frame["price"].rolling(5, min_periods=3).std(ddof=0)
    frame["z_score"] = (frame["price"] - frame["rolling_mean"]) / frame["rolling_std"].replace(0, np.nan)
    frame["change_pct"] = frame["price"].pct_change() * 100
    frame["interval_seconds"] = pd.to_numeric(frame["updatedAt"]).diff()
    features = frame[["price", "change_pct", "interval_seconds"]].fillna(0)
    frame["isolation_outlier"] = IsolationForest(contamination=0.1, random_state=42).fit_predict(features) == -1
    return {
        "data": frame.replace({np.nan: None}).to_dict(orient="records"),
        "provenance": {"source": "Chainlink TUSD/USD supplied sample", "type": "HISTORICAL"},
        "analysis": {"type": "DERIVED", "model": "Isolation Forest + rolling z-score", "contamination": 0.1},
    }


@app.get("/replay/euler")
def euler_replay():
    files = sorted(DATA.glob("export-*.csv"))
    if not files:
        raise HTTPException(status_code=404, detail="Euler exports unavailable")
    frames = [pd.read_csv(file_path).assign(dataset=file_path.name) for file_path in files]
    frame = pd.concat(frames, ignore_index=True).drop_duplicates(subset=["Transaction Hash"]).sort_values(["Blockno", "DateTime (UTC)"])
    return {"data": frame.to_dict(orient="records"), "provenance": {"source": "Etherscan exports", "type": "HISTORICAL"}}
