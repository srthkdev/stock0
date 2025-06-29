#!/usr/bin/env python3
"""
Test script for the portfolio functionality
"""

import requests
import json
import time

def test_portfolio_creation():
    """Test creating an auto portfolio"""
    
    # Test data
    portfolio_request = {
        "user_id": "test_user_123",
        "portfolio_name": "Test Growth Portfolio",
        "preferences": {
            "budget": 10000,
            "risk_profile": "moderate",
            "investment_goal": "growth",
            "target_return": 10,
            "time_horizon_years": 5,
            "preferred_sectors": ["technology", "healthcare"],
            "exclude_sectors": [],
            "notes": "Test portfolio for demo"
        }
    }
    
    print("🚀 Testing Portfolio Creation...")
    print(f"Request: {json.dumps(portfolio_request, indent=2)}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/portfolio/create",
            json=portfolio_request,
            timeout=30
        )
        
        if response.status_code == 200:
            portfolio = response.json()
            print("✅ Portfolio created successfully!")
            print(f"Portfolio ID: {portfolio.get('id', 'N/A')}")
            print(f"Name: {portfolio.get('name', 'N/A')}")
            print(f"Total Invested: ${portfolio.get('total_invested', 0):,.2f}")
            print(f"Holdings: {len(portfolio.get('holdings', []))}")
            
            # Print holdings
            for holding in portfolio.get('holdings', [])[:3]:  # Show first 3
                print(f"  - {holding.get('ticker')}: {holding.get('quantity')} shares @ ${holding.get('average_price', 0):.2f}")
            
            return portfolio.get('id')
        else:
            print(f"❌ Failed to create portfolio: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_portfolio_chat(portfolio_id):
    """Test chatting with portfolio"""
    
    if not portfolio_id:
        print("⚠️ No portfolio ID to test chat")
        return
    
    chat_request = {
        "portfolio_id": portfolio_id,
        "user_id": "test_user_123",
        "message": "How is my portfolio performing?"
    }
    
    print("\n💬 Testing Portfolio Chat...")
    print(f"Message: {chat_request['message']}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/portfolio/chat",
            json=chat_request,
            timeout=30
        )
        
        if response.status_code == 200:
            chat_response = response.json()
            print("✅ Chat response received!")
            print(f"Response: {chat_response.get('message', 'No message')}")
            
            if chat_response.get('suggestions'):
                print("Suggestions:")
                for suggestion in chat_response['suggestions']:
                    print(f"  - {suggestion}")
        else:
            print(f"❌ Failed to chat: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_health():
    """Test health endpoint"""
    print("🏥 Testing Health Endpoint...")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=10)
        
        if response.status_code == 200:
            health = response.json()
            print("✅ Backend is healthy!")
            print(f"Status: {health.get('status')}")
            print("Services:")
            for service, status in health.get('services', {}).items():
                print(f"  - {service}: {status}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")

if __name__ == "__main__":
    print("🧪 Testing Portfolio Backend\n")
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(2)
    
    # Test health
    test_health()
    
    # Test portfolio creation
    portfolio_id = test_portfolio_creation()
    
    # Test chat
    test_portfolio_chat(portfolio_id)
    
    print("\n✅ Test completed!") 