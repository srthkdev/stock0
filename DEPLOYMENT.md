# 🚀 Deployment Guide

This guide explains how to deploy Stock0 with the backend on Railway and frontend on Vercel.

## 🛤️ Railway Backend Deployment

### Prerequisites
- Railway account
- GitHub repository connected to Railway

### Configuration Files
- `nixpacks.toml` - Tells Railway how to build the Python backend
- `railway.json` - Alternative Railway configuration
- `Procfile` - Fallback process definition

### Steps
1. **Connect Repository to Railway**
   ```bash
   # If you have Railway CLI installed
   railway login
   railway link
   ```

2. **Set Environment Variables in Railway Dashboard**
   - Go to your Railway project dashboard
   - Navigate to Variables tab
   - Add these environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   FINNHUB_API_KEY=your_finnhub_api_key
   TAVILY_API_KEY=your_tavily_api_key
   MEM0_API_KEY=your_mem0_api_key
   APPWRITE_PROJECT_ID=your_appwrite_project_id
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_API_KEY=your_appwrite_api_key
   APPWRITE_DATABASE_ID=your_database_id
   APPWRITE_PORTFOLIOS_COLLECTION_ID=your_portfolios_collection_id
   ```

3. **Deploy**
   - Push your changes to GitHub
   - Railway will automatically deploy using the configuration files

4. **Get Your Railway URL**
   - Go to Railway dashboard → Your project → Settings → Domains
   - Copy the public domain (e.g., `https://your-app.up.railway.app`)

## ▲ Vercel Frontend Deployment

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Configuration Files
- `frontend/vercel.json` - Frontend-specific configuration
- `.vercelignore` - Excludes backend files from frontend deployment

### Steps
1. **Connect Repository to Vercel**
   - Go to Vercel dashboard
   - Import your GitHub repository
   - **IMPORTANT**: Set Root Directory to `frontend` during import

2. **Configure Build Settings** (if not set during import)
   - Go to Project Settings → General
   - Root Directory: `frontend`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Set Environment Variables in Vercel Dashboard**
   - Go to your Vercel project → Settings → Environment Variables
   - Add these variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
   NEXT_PUBLIC_NEWS_API_URL=https://your-railway-app.up.railway.app
   NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
   NEXT_PUBLIC_APPWRITE_STORAGE_ID=your_storage_id
   NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id
   APPWRITE_API_KEY=your_appwrite_api_key
   NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key
   NODE_ENV=production
   ```

4. **Deploy**
   - Push your changes to GitHub
   - Vercel will automatically deploy

## 🔗 Connecting Frontend to Backend

### Update Environment Variables
Replace `https://your-railway-app.up.railway.app` with your actual Railway URL in:
- Vercel environment variables
- Local `.env.local` file for development

### Test the Connection
1. **Backend Health Check**
   ```
   GET https://your-railway-app.up.railway.app/health
   ```

2. **Frontend API Calls**
   - All API calls in the frontend now use the centralized `API_ENDPOINTS` from `lib/api-config.ts`
   - This automatically uses the `NEXT_PUBLIC_API_URL` environment variable

## 🔧 Troubleshooting

### Railway Issues
- **Build Fails**: Check `nixpacks.toml` configuration
- **Port Issues**: Ensure backend uses `PORT` environment variable
- **Dependencies**: Verify `requirements.txt` is in the `backend/` directory

### Vercel Issues
- **Build Fails**: Check if root directory is set to `frontend`
- **Next.js Not Detected**: Ensure root directory is set to `frontend` in project settings
- **API Calls Fail**: Verify `NEXT_PUBLIC_API_URL` environment variable
- **CORS Issues**: Check Railway backend CORS configuration
- **NPM Vulnerabilities**: Run `npm audit fix` in the frontend directory to address security issues

### CORS Configuration
The backend is configured to allow all origins for development. For production, update the CORS middleware in `backend/app.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-app.vercel.app"],  # Restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 Monitoring

### Railway
- Check logs in Railway dashboard → Your project → Deployments
- Monitor health endpoint: `/health`

### Vercel
- Check function logs in Vercel dashboard → Your project → Functions
- Monitor build logs in Deployments tab

## 🔄 Development Workflow

1. **Local Development**
   ```bash
   # Backend
   cd backend
   python app.py --server

   # Frontend (new terminal)
   cd frontend
   npm run dev
   ```

2. **Deploy Changes**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
   Both Railway and Vercel will automatically deploy the changes.

## 🌐 URLs
- **Backend API**: `https://your-railway-app.up.railway.app`
- **Frontend App**: `https://your-vercel-app.vercel.app`
- **API Documentation**: `https://your-railway-app.up.railway.app/docs` 