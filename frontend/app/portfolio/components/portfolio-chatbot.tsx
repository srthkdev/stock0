'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AIConversation, AIConversationContent, AIConversationScrollButton } from '@/components/ai/conversation';
import { AIMessage, AIMessageContent, AIMessageAvatar } from '@/components/ai/message';
import { AIInput, AIInputTextarea, AIInputToolbar, AIInputSubmit } from '@/components/ai/input';
import { AISuggestions, AISuggestion } from '@/components/ai/suggestions';
import { API_ENDPOINTS } from '@/lib/api-config';

interface Message {
  id: string;
  content: string;
  from: 'user' | 'assistant';
  timestamp: Date;
}

interface Portfolio {
  id: string;
  name: string;
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

const INITIAL_SUGGESTIONS = [
  'How is my portfolio performing?',
  'What are my best holdings?',
  'Should I rebalance my portfolio?',
  'What are the current market trends?',
  'Analyze my risk exposure',
];

export default function PortfolioChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI portfolio assistant. I can help you analyze your investments, suggest strategies, and answer questions about your portfolio. Do you have a portfolio you\'d like me to analyze?',
      from: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);

  // Load user portfolios on component mount
  useEffect(() => {
    loadUserPortfolios();
  }, []);

  const loadUserPortfolios = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.portfolio.getUserPortfolios('demo_user_123'));
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.portfolios.length > 0) {
          setPortfolios(data.portfolios);
          setSelectedPortfolio(data.portfolios[0].id); // Auto-select first portfolio
          
          // Add welcome message with portfolio info
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            content: `I found ${data.portfolios.length} portfolio(s) in your account. I'm now connected to "${data.portfolios[0].name}" with a current value of $${data.portfolios[0].current_value?.toLocaleString() || '0'}. What would you like to know about your investments?`,
            from: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, welcomeMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to load portfolios:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      from: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (!selectedPortfolio) {
        // If no portfolio selected, provide general response
        setTimeout(() => {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "I'd be happy to help you with your investment questions! However, I don't have access to a specific portfolio to analyze. You can create a new portfolio using the AI Portfolio Creator on the right, and then I'll be able to provide personalized insights about your holdings and performance.",
            from: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Send chat request to backend
      const response = await fetch(API_ENDPOINTS.portfolio.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio_id: selectedPortfolio,
          user_id: 'demo_user_123',
          message: userMessage.content
        }),
      });

      if (response.ok) {
        const chatResponse = await response.json();
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: chatResponse.message,
          from: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);

        // If portfolio analysis was included, add it as a follow-up message
        if (chatResponse.portfolio_analysis) {
          const analysis = chatResponse.portfolio_analysis;
          const analysisMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: `📊 **Portfolio Analysis:**\n\n• Total Value: $${analysis.total_value.toLocaleString()}\n• Total Invested: $${analysis.total_invested.toLocaleString()}\n• Gain/Loss: $${analysis.gain_loss.toLocaleString()} (${analysis.gain_loss_percent.toFixed(1)}%)\n\n**Sector Allocation:**\n${Object.entries(analysis.sector_allocation).map(([sector, percent]) => `• ${sector}: ${(percent as number).toFixed(1)}%`).join('\n')}\n\n**Recommendations:**\n${analysis.recommendations.map((rec: string) => `• ${rec}`).join('\n')}`,
            from: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, analysisMessage]);
        }
      } else {
        throw new Error('Failed to get response from AI');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting to my analysis systems right now. Please make sure the backend server is running and try again.",
        from: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handlePortfolioSelect = (portfolioId: string) => {
    setSelectedPortfolio(portfolioId);
    const portfolio = portfolios.find(p => p.id === portfolioId);
    if (portfolio) {
      const switchMessage: Message = {
        id: Date.now().toString(),
        content: `Switched to portfolio "${portfolio.name}" (Value: $${portfolio.current_value?.toLocaleString() || '0'}). How can I help you with this portfolio?`,
        from: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, switchMessage]);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">🤖 AI Portfolio Assistant</CardTitle>
        {portfolios.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {portfolios.map((portfolio) => (
              <button
                key={portfolio.id}
                onClick={() => handlePortfolioSelect(portfolio.id)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedPortfolio === portfolio.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted hover:bg-muted/80 border-border text-foreground'
                }`}
              >
                {portfolio.name}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <AIConversation className="flex-1 max-h-[400px]">
          <AIConversationContent>
            {messages.map((message) => (
              <AIMessage key={message.id} from={message.from}>
                <AIMessageContent>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </AIMessageContent>
                <AIMessageAvatar
                  src={message.from === 'assistant' ? '/ai-avatar.png' : '/user-avatar.png'}
                  name={message.from === 'assistant' ? 'AI' : 'You'}
                />
              </AIMessage>
            ))}
            {isLoading && (
              <AIMessage from="assistant">
                <AIMessageContent>
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">Analyzing your portfolio...</div>
                  </div>
                </AIMessageContent>
                <AIMessageAvatar
                  src="/ai-avatar.png"
                  name="AI"
                />
              </AIMessage>
            )}
          </AIConversationContent>
          <AIConversationScrollButton />
        </AIConversation>
        
        <div className="p-4 border-t">
          <div className="mb-3">
            <AISuggestions>
              {INITIAL_SUGGESTIONS.map((suggestion) => (
                <AISuggestion
                  key={suggestion}
                  suggestion={suggestion}
                  onClick={handleSuggestionClick}
                />
              ))}
            </AISuggestions>
          </div>
          
          <AIInput onSubmit={handleSubmit}>
            <AIInputTextarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                selectedPortfolio 
                  ? "Ask about your portfolio performance, holdings, or get investment advice..."
                  : "Create a portfolio first, then I can provide personalized analysis..."
              }
              disabled={isLoading}
            />
            <AIInputToolbar>
              <div />
              <AIInputSubmit 
                status={isLoading ? 'submitted' : 'ready'}
                disabled={!inputValue.trim() || isLoading}
              />
            </AIInputToolbar>
          </AIInput>
        </div>
      </CardContent>
    </Card>
  );
} 