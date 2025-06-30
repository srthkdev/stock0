#!/usr/bin/env python3
"""
Railway entry point for Stock0 backend
"""

import os
import sys

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import and run the backend app
from backend.app import create_fastapi_app
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting Stock0 API on port {port}")
    
    app = create_fastapi_app()
    uvicorn.run(app, host="0.0.0.0", port=port) 