# run_frontend.py
import sys
import subprocess
import os

if __name__ == "__main__":
    app_path = os.path.join(os.path.dirname(__file__), "frontend", "app.py")
    print(f"🚀 Starting Quantum Route Optimizer Streamlit Dashboard ({app_path})...")
    subprocess.run([sys.executable, "-m", "streamlit", "run", app_path])
