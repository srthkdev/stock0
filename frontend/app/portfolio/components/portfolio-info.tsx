'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Calendar,
  Building,
  Percent,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api-config';

interface StockHolding {
  ticker: string;
  name: string;
  sector: string;
  quantity: number;
  average_price: number;
  current_price?: number;
  total_value?: number;
  gain_loss?: number;
  gain_loss_percent?: number;
  justification?: string;
}

interface PortfolioPreferences {
  budget: number;
  risk_profile: string;
  investment_goal: string;
  target_return: number;
  time_horizon_years: number;
  preferred_sectors: string[];
  exclude_sectors?: string[];
  notes?: string;
}

interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  preferences: PortfolioPreferences;
  holdings: StockHolding[];
  total_invested: number;
  current_value?: number;
  cash_remaining: number;
  total_gain_loss?: number;
  total_gain_loss_percent?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface PortfolioInfoProps {
  userId?: string;
}

export default function PortfolioInfo({ userId = 'demo_user_123' }: PortfolioInfoProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJustifications, setShowJustifications] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.portfolio.getUserPortfolios(userId));
      const data = await response.json();
      
      if (data.success && data.portfolios.length > 0) {
        setPortfolios(data.portfolios);
        setSelectedPortfolio(data.portfolios[0]); // Auto-select first portfolio
      } else {
        setPortfolios([]);
        setSelectedPortfolio(null);
      }
    } catch (err) {
      console.error('Failed to load portfolios:', err);
      setError('Failed to load portfolios. Please check if the backend is running.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSectorAllocation = (holdings: StockHolding[]) => {
    const sectorMap: { [key: string]: number } = {};
    const totalValue = holdings.reduce((sum, h) => sum + (h.total_value || 0), 0);
    
    holdings.forEach(holding => {
      const value = holding.total_value || 0;
      if (sectorMap[holding.sector]) {
        sectorMap[holding.sector] += value;
      } else {
        sectorMap[holding.sector] = value;
      }
    });

    return Object.entries(sectorMap)
      .map(([sector, value]) => ({
        sector,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading portfolios...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={loadPortfolios} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (portfolios.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">No portfolios found</p>
            <p className="text-sm text-gray-500">Create your first portfolio using the form above</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const portfolio = selectedPortfolio;
  if (!portfolio) {
    return null;
  }

  const sectorAllocation = getSectorAllocation(portfolio.holdings);
  const totalGainLoss = portfolio.total_gain_loss || 0;
  const totalGainLossPercent = portfolio.total_gain_loss_percent || 0;
  const isPositive = totalGainLoss >= 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Selection */}
      {portfolios.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {portfolios.map((p) => (
                <Button
                  key={p.id}
                  variant={selectedPortfolio?.id === p.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPortfolio(p)}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{portfolio.name}</CardTitle>
              {portfolio.description && (
                <p className="text-sm text-muted-foreground mt-1">{portfolio.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getRiskColor(portfolio.preferences.risk_profile)}>
                {portfolio.preferences.risk_profile.toUpperCase()} RISK
              </Badge>
              <Button onClick={loadPortfolios} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Total Invested</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(portfolio.total_invested)}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">Current Value</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(portfolio.current_value || portfolio.total_invested)}
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
              {isPositive ? (
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
              )}
              <p className="text-sm text-gray-600">Total Gain/Loss</p>
              <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalGainLoss)}
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
              <Percent className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Return %</p>
              <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(totalGainLossPercent)}
              </p>
            </div>
          </div>

          {/* Portfolio Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Investment Strategy
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Goal:</span>
                  <span className="font-medium capitalize">{portfolio.preferences.investment_goal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Return:</span>
                  <span className="font-medium">{portfolio.preferences.target_return}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Horizon:</span>
                  <span className="font-medium">{portfolio.preferences.time_horizon_years} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cash Remaining:</span>
                  <span className="font-medium">{formatCurrency(portfolio.cash_remaining)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Portfolio Info
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Holdings:</span>
                  <span className="font-medium">{portfolio.holdings.length} stocks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(portfolio.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(portfolio.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sector Allocation */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Sector Allocation
            </h4>
            <div className="space-y-2">
              {sectorAllocation.map(({ sector, percentage }) => (
                <div key={sector} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{sector.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Details */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Holdings Details</CardTitle>
            <Button
              onClick={() => setShowJustifications(!showJustifications)}
              size="sm"
              variant="outline"
            >
              {showJustifications ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showJustifications ? 'Hide' : 'Show'} AI Reasoning
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.holdings.map((holding, index) => {
              const gainLoss = holding.gain_loss || 0;
              const gainLossPercent = holding.gain_loss_percent || 0;
              const isHoldingPositive = gainLoss >= 0;

              return (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-semibold text-lg">{holding.ticker}</h5>
                        <Badge variant="secondary" className="text-xs">
                          {holding.sector.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{holding.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatCurrency(holding.total_value || holding.quantity * holding.average_price)}
                      </p>
                      <p className="text-sm text-gray-600">{holding.quantity} shares</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Avg Price:</span>
                      <p className="font-medium">{formatCurrency(holding.average_price)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Price:</span>
                      <p className="font-medium">
                        {formatCurrency(holding.current_price || holding.average_price)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Gain/Loss:</span>
                      <p className={`font-medium ${isHoldingPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(gainLoss)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Return %:</span>
                      <p className={`font-medium ${isHoldingPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(gainLossPercent)}
                      </p>
                    </div>
                  </div>

                  {showJustifications && holding.justification && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700">
                        <strong>AI Selection Reasoning:</strong> {holding.justification}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 