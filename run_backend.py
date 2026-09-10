# run_backend.py
import uvicorn
import os
import sys

# Ensure root is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    is_prod = os.environ.get("ENVIRONMENT", "development").lower() == "production"

    print("🚀 Starting Quantum Route Optimizer FastAPI Backend Server...")
    print(f"📡 Host: {host} | Port: {port} | Environment: {'Production' if is_prod else 'Development'}")
    print(f"📖 OpenAPI Swagger Documentation: http://{host if host != '0.0.0.0' else '127.0.0.1'}:{port}/docs")
    print(f"⚡ WebSocket Endpoint: ws://{host if host != '0.0.0.0' else '127.0.0.1'}:{port}/ws/optimize")

    uvicorn.run("backend.app.main:app", host=host, port=port, reload=not is_prod)
