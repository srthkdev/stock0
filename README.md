# Stock0

A comprehensive stock market dashboard built with Next.js, featuring real-time data, market analysis, and Google authentication via Appwrite.

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Zod** - TypeScript-first schema validation
- **Zustand** - State management
- **React Query** - Data fetching and caching
- **Bun** - Fast JavaScript runtime and package manager

### Backend
- **Appwrite** - Backend-as-a-Service for authentication and data
- **Yahoo Finance API** - Real-time stock market data

## Features

- 🔐 **Google Authentication** - Secure OAuth login with Appwrite
- 📊 **Real-time Market Data** - Live stock prices and market indices
- 📈 **Interactive Charts** - Market visualization and analysis
- 🔍 **Stock Screener** - Filter and discover stocks
- 📱 **Responsive Design** - Works on all devices
- 🌙 **Dark Mode** - Theme switching support

## Environment Setup

### Prerequisites
- Node.js 18+ or Bun
- Appwrite Cloud account (or self-hosted instance)
- Google Cloud Console account for OAuth

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Stock0/frontend
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Environment Variables
Copy the example environment file and configure your variables:

```bash
cp .env.local.example .env.local
```

Fill in the following environment variables in `.env.local`:

#### Appwrite Configuration
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` - Your Appwrite project ID
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` - Appwrite endpoint (default: https://cloud.appwrite.io/v1)
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID` - Database ID for user data
- `NEXT_PUBLIC_APPWRITE_STORAGE_ID` - Storage bucket ID
- `NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID` - Users collection ID
- `APPWRITE_API_KEY` - Server-side API key with admin permissions
- `NEXT_PUBLIC_SITE_URL` - Your site URL (http://localhost:3000 for development)

### 4. Appwrite Setup

#### Create Appwrite Project
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Create a new project
3. Copy the Project ID to your `.env.local`

#### Configure Authentication
1. Go to **Auth** → **Settings**
2. Add your domain to **Domains**: `localhost:3000` (for development)
3. Go to **Auth** → **Providers**
4. Enable **Google** provider
5. Configure Google OAuth credentials (see Google Setup below)

#### Create API Key
1. Go to **Overview** → **Integrate with your server**
2. Create an API Key with the following scopes:
   - `sessions.write` - For session management
   - `users.read` - To read user data
   - `users.write` - To create/update users
   - `databases.read` - To read from databases
   - `databases.write` - To write to databases
3. Copy the API key to `APPWRITE_API_KEY` in `.env.local`

### 5. Google OAuth Setup

#### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **APIs & Services** → **Credentials**
5. Create **OAuth 2.0 Client ID**
6. Configure:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/auth/callback`
7. Copy Client ID and Client Secret

#### Configure in Appwrite
1. In Appwrite Console, go to **Auth** → **Providers**
2. Click on **Google**
3. Enter your Google Client ID and Client Secret
4. Save the configuration

### 6. Database Setup
```bash
# Run the development server first
bun dev

# Then create collections (see instructions below)
```

## Development

### Start Development Server
```bash
bun dev
```

The application will be available at `http://localhost:3000`

### Project Structure
```
frontend/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page (protected)
│   ├── auth/              # Authentication routes
│   └── stocks/            # Stock detail pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── stocks/           # Stock-specific components
├── lib/                  # Utility functions
│   ├── appwrite/         # Appwrite configuration
│   └── yahoo-finance/    # Stock data fetching
└── types/                # TypeScript type definitions
```

## Authentication Flow

1. **Landing Page** (`/`) - Public landing page with "Get Started" button
2. **Authentication** - Google OAuth via Appwrite
3. **Dashboard** (`/dashboard`) - Protected route with market data
4. **Route Protection** - Middleware redirects unauthenticated users

## Appwrite Collections Setup

After setting up environment variables and running the app, you'll need to create the necessary collections. Please confirm your environment is properly configured before proceeding with collection creation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
