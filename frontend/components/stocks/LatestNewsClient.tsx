"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { fetchLatestNews, type NewsArticle } from "@/lib/news/fetchNews"
import Link from "next/link"
import Modal from "@/components/ui/modal"
import { ExternalLink, Bot, Sparkles, Loader2 } from "lucide-react"

// Simple markdown renderer for news content
function renderMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br>')
    // Wrap in paragraphs
    .replace(/^(.+)/gm, '<p class="mb-4">$1</p>')
    // Clean up extra paragraph tags
    .replace(/<p class="mb-4"><\/p>/g, '')
}

function getTimeAgo(category: string, period: 'day' | 'week' | 'month'): string {
  // Dynamic time ago based on period and category
  const timeMap: { [key: string]: { [key in 'day' | 'week' | 'month']: string } } = {
    "📈 Stocks": { day: "2 hours ago", week: "2 days ago", month: "1 week ago" },
    "🏦 Central Bank": { day: "4 hours ago", week: "3 days ago", month: "2 weeks ago" },
    "📊 Earnings": { day: "1 hour ago", week: "1 day ago", month: "5 days ago" },
    "🌍 Economy": { day: "6 hours ago", week: "4 days ago", month: "3 weeks ago" },
    "⚡ Commodities": { day: "3 hours ago", week: "5 days ago", month: "2 weeks ago" },
    "📰 General": { day: "1 hour ago", week: "2 days ago", month: "1 week ago" }
  }
  
  return timeMap[category]?.[period] || "1 hour ago"
}

function getCategoryColor(category: string): string {
  const colorMap: { [key: string]: string } = {
    "📈 Stocks": "text-green-400",
    "🏦 Central Bank": "text-blue-400",
    "📊 Earnings": "text-purple-400", 
    "🌍 Economy": "text-yellow-400",
    "⚡ Commodities": "text-orange-400",
    "📰 General": "text-gray-400"
  }
  
  return colorMap[category] || "text-gray-400"
}

function formatSnippet(snippet: string): string {
  // Remove markdown formatting and clean up the text
  return snippet
    .replace(/\|[^|]*\|/g, '') // Remove table syntax
    .replace(/#{1,6}\s*/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
}

// Fetch full article content from Tavily
async function fetchFullArticleContent(url: string): Promise<string> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_NEWS_API_URL || 'http://localhost:8000'
    const response = await fetch(`${API_BASE_URL}/api/article/full`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch full content')
    }

    const result = await response.json()
    return result.content || "Full content not available"
  } catch (error) {
    console.error('Error fetching full content:', error)
    return "Unable to fetch full article content at this time."
  }
}

function NewsCard({ article, index, period, onShowDetails }: { 
  article: NewsArticle; 
  index: number; 
  period: 'day' | 'week' | 'month';
  onShowDetails: (article: NewsArticle) => void;
}) {
  const timeAgo = getTimeAgo(article.category, period)
  const categoryColor = getCategoryColor(article.category)
  const formattedSnippet = formatSnippet(article.snippet)
  
  return (
    <div className="group">
      <div className="space-y-3 p-4 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-muted">
        {/* Title */}
        <h3 className="font-semibold text-foreground text-base leading-relaxed">
          {article.title}
        </h3>
        
        {/* Category and Time */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${categoryColor.replace('text-', 'bg-')}`} />
            <span className={categoryColor}>{article.category.split(' ')[1] || 'General'}</span>
          </div>
          <span className="text-muted-foreground">{timeAgo}</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Bot className="h-3 w-3" />
            <span className="text-xs">AI Powered</span>
          </div>
        </div>
        
        {/* Snippet */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {formattedSnippet}
        </p>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => onShowDetails(article)}
            className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            View AI Summary
          </button>
          <Link 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Source
          </Link>
        </div>
      </div>
    </div>
  )
}

interface LatestNewsClientProps {
  initialNews: NewsArticle[]
  initialPeriod: 'day' | 'week' | 'month'
}

export default function LatestNewsClient({ initialNews, initialPeriod }: LatestNewsClientProps) {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>(initialPeriod)
  const [news, setNews] = useState<NewsArticle[]>(initialNews)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fullContent, setFullContent] = useState<string>("")
  const [loadingContent, setLoadingContent] = useState(false)

  const handleTabChange = async (period: 'day' | 'week' | 'month') => {
    if (period === activeTab) return
    
    setActiveTab(period)
    setLoading(true)
    setError(null)
    
    try {
      const newNews = await fetchLatestNews(period)
      setNews(newNews)
    } catch (err) {
      console.error('Failed to fetch news:', err)
      setError(`Failed to fetch ${period} news`)
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const getPeriodLabel = (period: 'day' | 'week' | 'month') => {
    switch (period) {
      case 'day': return 'Daily'
      case 'week': return 'Weekly'
      case 'month': return 'Monthly'
    }
  }

  const handleShowDetails = async (article: NewsArticle) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
    setLoadingContent(true)
    setFullContent("")
    
    try {
      const content = await fetchFullArticleContent(article.url)
      setFullContent(content)
    } catch (error) {
      console.error('Failed to generate summary:', error)
      setFullContent("Unable to generate article summary. Please visit the original source for full details.")
    } finally {
      setLoadingContent(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedArticle(null)
    setFullContent("")
    setLoadingContent(false)
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="relative space-y-6">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Latest News</h2>
          
          {/* Period Toggle */}
          <div className="flex rounded-lg bg-muted p-1">
            {(['day', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => handleTabChange(period)}
                disabled={loading}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
                  activeTab === period
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                {getPeriodLabel(period)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-lg font-medium text-foreground mb-2">Loading News...</h3>
            <p className="text-sm text-muted-foreground">
              Fetching {getPeriodLabel(activeTab).toLowerCase()} financial news
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-4">📰</div>
            <h3 className="text-lg font-medium text-foreground mb-2">News API Not Available</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {error}
            </p>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Start the backend: <code className="bg-muted px-1 rounded">cd backend && source venv/bin/activate && python app.py --server</code>
              </p>
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No News Available</h3>
            <p className="text-sm text-muted-foreground">
              No {getPeriodLabel(activeTab).toLowerCase()} financial news found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.slice(0, 6).map((article, index) => (
              <NewsCard 
                key={index} 
                article={article} 
                index={index} 
                period={activeTab}
                onShowDetails={handleShowDetails}
              />
            ))}
          </div>
        )}
        
        {/* AI/Tavily Branding */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t">
          <Bot className="h-4 w-4" />
          <span>Powered by AI via</span>
          <Sparkles className="h-3 w-3" />
          <span className="font-medium">Tavily API</span>
        </div>
      </div>

      {/* Modal for full news details */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`AI Summary: ${selectedArticle?.title || "News Details"}`}
        size="xl"
      >
        {selectedArticle && (
          <div className="space-y-6">
            {/* Category and Time */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getCategoryColor(selectedArticle.category).replace('text-', 'bg-')}`} />
                <span className={getCategoryColor(selectedArticle.category)}>
                  {selectedArticle.category.split(' ')[1] || 'General'}
                </span>
              </div>
              <span className="text-muted-foreground">
                {getTimeAgo(selectedArticle.category, activeTab)}
              </span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Bot className="h-3 w-3" />
                <span className="text-xs">AI Powered</span>
              </div>
            </div>
            
            {/* Full Content */}
            <div className="max-h-96 overflow-y-auto">
              {loadingContent ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Generating AI summary with key numbers...</span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdown(fullContent || selectedArticle.snippet) 
                    }} 
                  />
                </div>
              )}
            </div>
            
            {/* Source Link */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>AI-powered summary with key metrics via Tavily</span>
              </div>
              <Link
                href={selectedArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Read Original Article
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
} 