# Safe Sphere

Institutional Web3 security and protocol analytics terminal.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Historical datasets work without credentials. Copy optional variable names from `.env.example` into `.env.local` to enable credential-backed services.

## Analysis API

```bash
python -m venv .venv
.venv/Scripts/pip install -r backend/requirements.txt
.venv/Scripts/uvicorn backend.main:app --reload --port 8000
```

The FastAPI service exposes health, Pandas/NumPy rolling oracle analysis, Isolation Forest output, and Euler replay records. Set `ANALYSIS_API_URL` when deploying it separately.

## Data Integrity

- `LIVE`: fetched from a public or configured source at runtime.
- `HISTORICAL`: loaded unchanged from the supplied dataset pack.
- `DERIVED`: calculated from a disclosed source and method.
- `SIMULATION`: modeled dependency exposure, never confirmed compromise.

Unavailable APIs return explicit source-unavailable states. Missing values remain blank and are not synthesized.

## Deployment

- Frontend: Vercel (`npm run build`)
- Analysis API: Railway or Render (`backend/requirements.txt`)
- Persistence: apply `supabase/schema.sql` to Supabase/PostgreSQL
- Tenderly: configure the optional variables in `.env.example`
