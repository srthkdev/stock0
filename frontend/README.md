# Stock0 Frontend

A modern Next.js application providing comprehensive stock market analysis, AI-powered portfolio management, and real-time financial data visualization.

## 🚀 Features

- 🔐 **Google Authentication** - Secure OAuth login with Appwrite
- 📊 **Real-time Market Dashboard** - Live stock prices, indices, and market data
- 📈 **Interactive Charts** - Advanced data visualization with Visx and D3.js
- 🔍 **Advanced Stock Screener** - Multi-criteria stock filtering and discovery
- 💼 **AI Portfolio Management** - Smart portfolio creation and optimization
- 💬 **Portfolio Chat Assistant** - AI-powered investment advice and analysis
- 📱 **Responsive Design** - Seamless experience across all devices
- 🌙 **Dark Mode** - Complete theme switching with system preference detection
- ⚡ **Performance Optimized** - Built with Next.js 14 App Router for optimal speed

## 🛠️ Tech Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Bun** - Fast JavaScript runtime and package manager

### UI & Components
- **shadcn/ui** - Modern, accessible UI component library
- **Radix UI** - Headless UI primitives
- **Lucide React** - Beautiful icon library
- **Visx** - Data visualization components
- **Recharts** - Chart library for React

### State & Data Management
- **Zustand** - Lightweight state management
- **React Query** - Data fetching and caching
- **Zod** - TypeScript-first schema validation

### Authentication & Backend
- **Appwrite** - Backend-as-a-Service for auth and data
- **Yahoo Finance API** - Real-time stock market data

## 📁 Project Structure

```
frontend/
├── app/                     # Next.js App Router
│   ├── (landing)/          # Landing page group
│   │   └── page.tsx        # Home/landing page
│   ├── api/                # API routes
│   │   └── finnhub-webhook/ # Webhook handlers
│   ├── auth/               # Authentication pages
│   │   └── callback/       # OAuth callback
│   ├── dashboard/          # Market dashboard
│   │   ├── layout.tsx      # Dashboard layout
│   │   └── page.tsx        # Dashboard page
│   ├── portfolio/          # Portfolio management
│   │   ├── components/     # Portfolio-specific components
│   │   ├── layout.tsx      # Portfolio layout
│   │   └── page.tsx        # Portfolio page
│   ├── screener/           # Stock screener
│   │   ├── components/     # Screener components
│   │   ├── layout.tsx      # Screener layout
│   │   └── page.tsx        # Screener page
│   ├── stocks/             # Individual stock pages
│   │   └── [ticker]/       # Dynamic stock pages
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # Reusable components
│   ├── ai/                # AI chat components
│   │   ├── conversation.tsx
│   │   ├── input.tsx
│   │   ├── message.tsx
│   │   └── suggestions.tsx
│   ├── chart/             # Chart components
│   │   ├── AreaClosedChart.tsx
│   │   ├── MarketsChart.tsx
│   │   ├── SimpleChart.tsx
│   │   └── StockChart.tsx
│   ├── stocks/            # Stock-related components
│   │   ├── EquitySectors.tsx
│   │   ├── GainersLosersActive.tsx
│   │   ├── LatestNews.tsx
│   │   └── SectorPerformance.tsx
│   └── ui/                # Base UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (more components)
├── lib/                   # Utility functions
│   ├── appwrite/         # Appwrite configuration
│   ├── yahoo-finance/    # Stock data fetching
│   └── utils.ts          # General utilities
├── types/                # TypeScript type definitions
│   ├── finnhub.ts
│   └── yahoo-finance.ts
└── middleware.ts         # Next.js middleware
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Appwrite account
- Google Cloud Console account (for OAuth)

### 1. Installation

```bash
cd frontend
bun install
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp env.local.example .env.local
```

Configure your environment variables:

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_STORAGE_ID=your_storage_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id
APPWRITE_API_KEY=your_server_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Development

Start the development server:
```bash
bun dev
```

Visit `http://localhost:3000` to see the application.

## 🔧 Configuration

### Appwrite Setup

#### 1. Create Project
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Create a new project
3. Copy the Project ID to your `.env.local`

#### 2. Configure Authentication
1. Navigate to **Auth** → **Settings**
2. Add your domain: `localhost:3000` (development)
3. Go to **Auth** → **Providers**
4. Enable **Google** provider
5. Configure OAuth credentials (see Google Setup)

#### 3. Create API Key
1. Go to **Overview** → **Integrate with your server**
2. Create API Key with scopes:
   - `sessions.write`
   - `users.read`
   - `users.write`
   - `databases.read`
   - `databases.write`
3. Add key to `APPWRITE_API_KEY` in `.env.local`

#### 4. Database Setup
1. Create a database
2. Create collections for users and portfolios
3. Set appropriate permissions
4. Update collection IDs in environment variables

### Google OAuth Setup

#### 1. Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable **Google+ API**
4. Go to **APIs & Services** → **Credentials**
5. Create **OAuth 2.0 Client ID**:
   - Application type: Web application
   - Authorized origins: `http://localhost:3000`
   - Redirect URIs: `http://localhost:3000/auth/callback`

#### 2. Configure in Appwrite
1. In Appwrite Console: **Auth** → **Providers** → **Google**
2. Enter Google Client ID and Secret
3. Save configuration

## 🎨 UI Components

### Design System
- **Colors**: Tailwind CSS color palette with dark mode support
- **Typography**: Inter font with optimized loading
- **Spacing**: Consistent spacing scale
- **Components**: shadcn/ui component library

### Key Components

#### Navigation
- Responsive navigation bar
- User authentication state
- Theme toggle
- Breadcrumb navigation

#### Charts
- **AreaClosedChart**: Filled area charts for trends
- **StockChart**: Candlestick and line charts
- **MarketsChart**: Market overview charts
- **SimpleChart**: Basic line charts

#### AI Components
- **Conversation**: Chat interface container
- **Message**: Individual chat messages
- **Input**: Chat input with suggestions
- **Suggestions**: Quick action suggestions

#### Stock Components
- **EquitySectors**: Sector performance display
- **GainersLosersActive**: Market movers
- **LatestNews**: Financial news feed
- **SectorPerformance**: Sector analysis

## 📊 Data Integration

### Yahoo Finance Integration
```typescript
// Fetch stock data
import { fetchStockData } from '@/lib/yahoo-finance'

const stockData = await fetchStockData('AAPL')
```

### Appwrite Integration
```typescript
// User authentication
import { getCurrentUser } from '@/lib/appwrite/auth'

const user = await getCurrentUser()
```

### Backend API Integration
```typescript
// Portfolio operations
const response = await fetch('/api/portfolio/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(portfolioData)
})
```

## 🔐 Authentication Flow

1. **Landing Page** (`/`) - Public homepage
2. **Google OAuth** - Redirect to Google for authentication
3. **Callback** (`/auth/callback`) - Process OAuth response
4. **Dashboard** (`/dashboard`) - Protected main application
5. **Route Protection** - Middleware redirects unauthenticated users

### Protected Routes
- `/dashboard` - Market dashboard
- `/portfolio` - Portfolio management
- `/screener` - Stock screener
- `/stocks/[ticker]` - Individual stock pages

## 🎯 Features Deep Dive

### Dashboard
- Real-time market indices (S&P 500, NASDAQ, Dow Jones)
- Sector performance heatmap
- Top gainers, losers, and most active stocks
- Market news feed
- Fear & Greed Index

### Stock Screener
- Multi-criteria filtering:
  - Market cap ranges
  - Sector selection
  - Price ranges
  - Performance metrics
- Sortable data table
- Export functionality
- Real-time data updates

### Portfolio Management
- AI-powered portfolio creation
- Interactive chat assistant
- Performance tracking
- Risk analysis
- Rebalancing suggestions
- Historical performance charts

### Individual Stock Pages
- Real-time price and charts
- Company financial summary
- Latest news and analysis
- Technical indicators
- Peer comparison

## 🚀 Performance Optimization

### Next.js Optimizations
- App Router for optimal routing
- Server Components for reduced bundle size
- Image optimization with `next/image`
- Font optimization with `next/font`
- Static generation where possible

### Bundle Optimization
- Tree shaking for unused code elimination
- Dynamic imports for code splitting
- Optimized CSS with Tailwind purging
- Compressed assets

### Data Fetching
- Server-side rendering for SEO
- Client-side caching with React Query
- Optimistic updates for better UX
- Error boundaries for graceful failures

## 🧪 Testing

### Development Testing
```bash
# Lint code
bun run lint

# Type checking
bun run type-check

# Build verification
bun run build
```

### Manual Testing
1. Authentication flow
2. Data fetching and display
3. Responsive design
4. Theme switching
5. Navigation and routing

## 🚀 Deployment

### Vercel Deployment (Recommended)
```bash
# Build the application
bun run build

# Deploy to Vercel
vercel --prod
```

### Environment Variables for Production
- Update `NEXT_PUBLIC_SITE_URL` to production URL
- Configure Appwrite domains for production
- Update Google OAuth redirect URIs
- Set production API endpoints

### Build Optimization
- Enable static optimization
- Configure CDN for assets
- Set up proper caching headers
- Monitor Core Web Vitals

## 🔧 Development Tools

### Code Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Tailwind CSS IntelliSense** - CSS class suggestions

### Debugging
- React Developer Tools
- Next.js DevTools
- Browser debugging tools
- Console logging utilities

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Test thoroughly across devices
5. Submit pull request

### Code Standards
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful component and function names
- Add proper error handling
- Include responsive design considerations

### Component Guidelines
- Use shadcn/ui components when possible
- Follow Radix UI patterns for accessibility
- Implement proper loading and error states
- Add proper TypeScript types
- Include JSDoc comments for complex functions

## 📱 Mobile Responsiveness

### Breakpoints
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

### Mobile Features
- Touch-friendly navigation
- Optimized chart interactions
- Responsive data tables
- Mobile-first design approach
- Progressive Web App capabilities

## 🌙 Theme System

### Dark Mode Support
- System preference detection
- Manual theme switching
- Persistent theme selection
- Proper contrast ratios
- Optimized for both light and dark modes

### Customization
- CSS custom properties
- Tailwind CSS configuration
- Component-level theme overrides
- Consistent color palette

## 📄 License

This project is licensed under the MIT License.

---

**Stock0 Frontend** - Modern Stock Market Dashboard
