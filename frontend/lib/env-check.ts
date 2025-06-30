/**
 * Environment variable validation and debugging
 */

export const ENV_VARS = {
  // Required environment variables
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_NEWS_API_URL: process.env.NEXT_PUBLIC_NEWS_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  
  // Appwrite configuration
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  
  // Environment info
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
} as const;

export const checkEnvironment = () => {
  const missing = Object.entries(ENV_VARS)
    .filter(([key, value]) => !value && key.startsWith('NEXT_PUBLIC_'))
    .map(([key]) => key);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    vars: ENV_VARS,
  };
};

// Log environment status in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const envCheck = checkEnvironment();
  console.log('Environment check:', envCheck);
} 