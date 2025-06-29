import PortfolioChatbot from './components/portfolio-chatbot';
import PortfolioForm from './components/portfolio-form';
import PortfolioInfo from './components/portfolio-info';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic'

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-muted-foreground">
          Manage your investments with AI-powered insights and portfolio tracking.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* AI Chatbot - 40% */}
        <div className="w-full lg:w-2/5">
          <PortfolioChatbot />
        </div>

        {/* Portfolio Form - 60% */}
        <div className="w-full lg:w-3/5">
          <PortfolioForm />
        </div>
      </div>

      {/* Portfolio Information Section */}
      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Your Portfolios</h2>
          <p className="text-muted-foreground">
            View detailed information about your created portfolios and holdings.
          </p>
        </div>
        <PortfolioInfo />
      </div>
    </div>
  );
} 