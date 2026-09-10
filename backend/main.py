# backend/main.py
import uvicorn
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if __name__ == "__main__":
    print("🚀 Starting Quantum Route Optimizer FastAPI Backend Server...")
    print("📖 OpenAPI Swagger Documentation: http://127.0.0.1:8000/docs")
    print("⚡ WebSocket Endpoint: ws://127.0.0.1:8000/ws/optimize")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
