# frontend/config.py
import streamlit as st

PAGE_CONFIG = {
    "page_title": "Quantum Logistics Pro | QPSO Engine",
    "page_icon": "⚛️",
    "layout": "wide",
    "initial_sidebar_state": "expanded"
}

CUSTOM_CSS = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Roboto:wght@300;400;500;700&family=Fira+Code:wght@400;600&display=swap');

    .stApp {
        background: radial-gradient(circle at top left, #0b1021 0%, #05050a 100%);
        color: #e0e6ed;
        font-family: 'Roboto', sans-serif;
    }

    section[data-testid="stSidebar"] {
        background-color: rgba(10, 12, 20, 0.96);
        border-right: 1px solid rgba(0, 243, 255, 0.15);
    }
    
    h1, h2, h3 {
        font-family: 'Orbitron', sans-serif;
        background: -webkit-linear-gradient(0deg, #00f3ff, #bc13fe);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700 !important;
        letter-spacing: 1px;
    }
    
    div[data-testid="stMetric"], div[data-testid="stExpander"] {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(12px);
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 14px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
    }
    
    div[data-testid="stMetric"]:hover {
        border-color: rgba(0, 243, 255, 0.4);
        box-shadow: 0 0 18px rgba(0, 243, 255, 0.25);
    }

    div[data-testid="stMetricValue"] {
        color: #00f3ff !important;
        font-family: 'Orbitron', sans-serif;
        font-size: 26px !important;
        text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
    }
    
    div[data-testid="stMetricLabel"] {
        color: #a0aab5 !important;
        font-size: 13px !important;
        font-weight: 500;
    }

    div.stButton > button {
        background: rgba(0, 243, 255, 0.05) !important;
        border: 1px solid #00f3ff !important;
        color: #00f3ff !important;
        border-radius: 10px !important;
        font-family: 'Orbitron', sans-serif !important;
        transition: all 0.3s ease !important;
    }
    
    div.stButton > button:hover {
        background: rgba(0, 243, 255, 0.15) !important;
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.45);
        transform: translateY(-2px);
    }
    
    div.stButton > button[kind="primary"] {
        background: rgba(0, 243, 255, 0.1) !important;
        border: 2px solid #00f3ff !important;
        color: #00f3ff !important;
        font-family: 'Orbitron', sans-serif !important;
        font-weight: 700 !important;
        letter-spacing: 1.2px;
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.3);
    }

    div[data-testid="stDownloadButton"] > button {
        background: rgba(188, 19, 254, 0.1) !important;
        border: 1px solid #bc13fe !important;
        color: #bc13fe !important;
        font-family: 'Orbitron', sans-serif !important;
        border-radius: 10px !important;
    }
</style>
"""

def load_css():
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)
