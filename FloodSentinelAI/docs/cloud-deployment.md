# Cloud Deployment Notes

Recommended production stack:

- Backend: Render, Railway, Fly.io, Azure App Service, or AWS Elastic Beanstalk
- Database: Neon Postgres, Supabase Postgres, Railway Postgres, AWS RDS, or Azure Database for PostgreSQL
- Version control: GitHub repository with protected `main`
- Runtime command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Production environment variables:

```text
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/floodsentinelai
ALLOWED_ORIGINS=https://your-production-domain.example
```

The current ML services are runnable prototype models. Replace the internals of:

- `backend/app/services/prediction_service.py`
- `backend/app/services/satellite_service.py`

with trained model loading and inference when your TensorFlow, PyTorch, or ONNX models are ready.
