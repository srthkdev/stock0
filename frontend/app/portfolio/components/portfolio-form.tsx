'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api-config';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  total_invested: number;
  current_value: number;
  holdings: Array<{
    ticker: string;
    name: string;
    quantity: number;
    current_price: number;
    total_value: number;
  }>;
}

export default function PortfolioForm() {
  const [portfolioName, setPortfolioName] = useState('');
  const [budget, setBudget] = useState('');
  const [riskProfile, setRiskProfile] = useState('');
  const [investmentGoal, setInvestmentGoal] = useState('');
  const [targetReturn, setTargetReturn] = useState('');
  const [timeHorizon, setTimeHorizon] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdPortfolio, setCreatedPortfolio] = useState<Portfolio | null>(null);

  const availableSectors = [
    'technology',
    'healthcare', 
    'finance',
    'consumer',
    'energy',
    'utilities',
    'materials',
    'industrials',
    'telecommunications',
    'real_estate'
  ];

  const handleSectorToggle = (sector: string) => {
    if (sectors.includes(sector)) {
      setSectors(sectors.filter(s => s !== sector));
    } else if (sectors.length < 3) {
      setSectors([...sectors, sector]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioName || !budget || !riskProfile || !investmentGoal || sectors.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const requestData = {
        user_id: 'demo_user_123', // In real app, get from auth
        portfolio_name: portfolioName,
        preferences: {
          budget: parseFloat(budget),
          risk_profile: riskProfile,
          investment_goal: investmentGoal,
          target_return: parseFloat(targetReturn) || 8,
          time_horizon_years: parseInt(timeHorizon) || 5,
          preferred_sectors: sectors,
          exclude_sectors: [],
          notes: notes
        }
      };

      const response = await fetch(API_ENDPOINTS.portfolio.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const portfolio = await response.json();
        setCreatedPortfolio(portfolio);
        alert(`Portfolio "${portfolio.name}" created successfully with ${portfolio.holdings.length} stocks!`);
      } else {
        const error = await response.json();
        alert(`Failed to create portfolio: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
      alert('Failed to create portfolio. Please check if the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  if (createdPortfolio) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg text-green-600 dark:text-green-400">✅ Portfolio Created Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-lg text-foreground">{createdPortfolio.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{createdPortfolio.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-foreground">Total Invested</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  ${createdPortfolio.total_invested.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Current Value</p>
                <p className="text-xl font-bold text-foreground">
                  ${(createdPortfolio.current_value || createdPortfolio.total_invested).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-foreground">Holdings ({createdPortfolio.holdings.length} stocks):</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {createdPortfolio.holdings.map((holding, index) => (
                  <div key={index} className="flex justify-between items-center bg-background dark:bg-card p-2 rounded border border-border">
                    <div>
                      <span className="font-medium text-foreground">{holding.ticker}</span>
                      <span className="text-sm text-muted-foreground ml-2">{holding.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-foreground">{holding.quantity} shares</div>
                      <div className="text-sm font-medium text-foreground">
                        ${(holding.total_value || holding.quantity * holding.current_price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => setCreatedPortfolio(null)}
              variant="outline"
              className="flex-1"
            >
              Create Another Portfolio
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Chat with Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">🤖 AI Portfolio Creator</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tell me your preferences and I&apos;ll automatically create a diversified portfolio for you
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="portfolio-name">Portfolio Name *</Label>
              <Input
                id="portfolio-name"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                placeholder="My Growth Portfolio"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget (USD) *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="10000"
                  min="100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="target-return">Target Return (%) *</Label>
                <Input
                  id="target-return"
                  type="number"
                  value={targetReturn}
                  onChange={(e) => setTargetReturn(e.target.value)}
                  placeholder="8"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="risk-profile">Risk Tolerance *</Label>
                <Select value={riskProfile} onValueChange={setRiskProfile} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Conservative (Low Risk)</SelectItem>
                    <SelectItem value="moderate">Moderate Risk</SelectItem>
                    <SelectItem value="high">Aggressive (High Risk)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="investment-goal">Investment Goal *</Label>
                <Select value={investmentGoal} onValueChange={setInvestmentGoal} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="time-horizon">Time Horizon (Years)</Label>
              <Input
                id="time-horizon"
                type="number"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(e.target.value)}
                placeholder="5"
                min="1"
                max="50"
              />
            </div>
          </div>

          {/* Sector Selection */}
          <div className="space-y-3">
            <Label>Preferred Sectors * (Select 1-3)</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableSectors.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  onClick={() => handleSectorToggle(sector)}
                  className={`p-2 text-sm rounded border transition-colors ${
                    sectors.includes(sector)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted hover:bg-muted/80 border-border text-foreground'
                  }`}
                >
                  {sector.charAt(0).toUpperCase() + sector.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: {sectors.length}/3 sectors
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Preferences</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific preferences, companies to avoid, ESG considerations, etc."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || sectors.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Your Portfolio...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create AI Portfolio
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 