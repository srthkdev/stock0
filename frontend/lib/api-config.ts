/**
 * Centralized API configuration for the frontend
 */

// Get the backend API URL from environment variables
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// News API URL (same as backend for now)
export const NEWS_API_URL = process.env.NEXT_PUBLIC_NEWS_API_URL || API_BASE_URL;

// API endpoints
export const API_ENDPOINTS = {
  // Health check
  health: `${API_BASE_URL}/health`,
  
  // Stock picking
  stockPick: `${API_BASE_URL}/api/stock-pick`,
  
  // Portfolio management
  portfolio: {
    create: `${API_BASE_URL}/api/portfolio/create`,
    chat: `${API_BASE_URL}/api/portfolio/chat`,
    getUserPortfolios: (userId: string) => `${API_BASE_URL}/api/portfolio/${userId}`,
  },
  
  // News endpoints
  news: {
    day: `${NEWS_API_URL}/api/news/day`,
    week: `${NEWS_API_URL}/api/news/week`,
    month: `${NEWS_API_URL}/api/news/month`,
    all: `${NEWS_API_URL}/api/news/all`,
    fullArticle: `${NEWS_API_URL}/api/article/full`,
  },
} as const;

// Helper function to check if we're in development
export const isDevelopment = process.env.NODE_ENV === 'development';

// Helper function to get the full API URL
export const getApiUrl = (endpoint: string) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Default fetch options for API calls
export const defaultFetchOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function for API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, {
    ...defaultFetchOptions,
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}; 