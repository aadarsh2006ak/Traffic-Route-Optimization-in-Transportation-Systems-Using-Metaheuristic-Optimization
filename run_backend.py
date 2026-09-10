# run_backend.py
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting Quantum Route Optimizer FastAPI Backend Server...")
    print("📖 OpenAPI Swagger Documentation available at: http://127.0.0.1:8000/docs")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
