#!/bin/bash

# Stock Portfolio App Setup Script
# This script sets up the complete application including frontend, backend, and Appwrite

set -e  # Exit on any error

echo "🚀 Stock Portfolio App Setup"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Setting up Stock Portfolio Application..."
echo ""

# Step 1: Check prerequisites
print_status "Step 1: Checking prerequisites..."

# Check for Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

# Check for Node.js/Bun
if ! command -v bun &> /dev/null && ! command -v node &> /dev/null; then
    print_error "Node.js or Bun is required but not installed"
    exit 1
fi

print_success "Prerequisites check passed"
echo ""

# Step 2: Setup Frontend
print_status "Step 2: Setting up frontend..."
cd frontend

if command -v bun &> /dev/null; then
    print_status "Installing frontend dependencies with Bun..."
    bun install
else
    print_status "Installing frontend dependencies with npm..."
    npm install
fi

print_success "Frontend dependencies installed"
cd ..
echo ""

# Step 3: Setup Backend
print_status "Step 3: Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
print_status "Installing backend dependencies..."
source venv/bin/activate

# Upgrade pip first
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

print_success "Backend dependencies installed"
cd ..
echo ""

# Step 4: Environment Setup
print_status "Step 4: Setting up environment files..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    print_status "Creating backend environment file..."
    cp backend/env.example backend/.env
    print_warning "Please update backend/.env with your API keys:"
    print_warning "  - FINNHUB_API_KEY (get from https://finnhub.io)"
    print_warning "  - OPENAI_API_KEY (get from https://openai.com)"
    print_warning "  - TAVILY_API_KEY (get from https://tavily.com)"
    print_warning "  - APPWRITE_PROJECT_ID, APPWRITE_API_KEY (get from https://appwrite.io)"
    print_warning "  - MEM0_API_KEY (get from https://mem0.ai)"
else
    print_status "Backend .env file already exists"
fi

# Frontend environment
if [ ! -f "frontend/.env.local" ]; then
    print_status "Creating frontend environment file..."
    cp frontend/env.local.example frontend/.env.local
    print_warning "Please update frontend/.env.local with your API keys if needed"
else
    print_status "Frontend .env.local file already exists"
fi

print_success "Environment files created"
echo ""

# Step 5: Instructions for Appwrite setup
print_status "Step 5: Appwrite Database Setup"
echo ""
print_warning "Before running the application, you need to set up Appwrite:"
echo ""
echo "1. Go to https://appwrite.io and create a new project"
echo "2. Get your Project ID and API Key from the Appwrite console"
echo "3. Update your backend/.env file with:"
echo "   APPWRITE_PROJECT_ID=your_project_id"
echo "   APPWRITE_API_KEY=your_api_key"
echo ""
echo "4. Then run the Appwrite setup script:"
echo "   cd frontend"
echo "   APPWRITE_PROJECT_ID=your_project_id APPWRITE_API_KEY=your_api_key bun run setup-appwrite"
echo ""

# Step 6: Final instructions
print_success "Setup completed successfully!"
echo ""
print_status "Next steps:"
echo ""
echo "1. Update your API keys in backend/.env"
echo "2. Set up Appwrite database (see instructions above)"
echo "3. Start the backend server:"
echo "   cd backend && source venv/bin/activate && python app.py --server"
echo ""
echo "4. In a new terminal, start the frontend:"
echo "   cd frontend && bun dev"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""

print_status "🎉 Happy coding!"
echo ""

# Optional: Test if we can import the main modules
print_status "Testing backend imports..."
cd backend
source venv/bin/activate

python3 -c "
try:
    import fastapi
    import pydantic
    import requests
    print('✅ Core dependencies imported successfully')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
" || print_warning "Some backend dependencies may not be installed correctly"

cd ..

print_success "Setup script completed!" 