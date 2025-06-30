export interface NewsArticle {
  title: string
  url: string
  category: string
  snippet: string
}

export interface NewsResponse {
  success: boolean
  period: string
  title: string
  data: NewsArticle[]
  timestamp: string
  count: number
  error?: string
}

export interface AllNewsResponse {
  success: boolean
  title: string
  data: {
    day: {
      title: string
      news: NewsArticle[]
      count: number
    }
    week: {
      title: string
      news: NewsArticle[]
      count: number
    }
    month: {
      title: string
      news: NewsArticle[]
      count: number
    }
  }
  timestamp: string
  error?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_NEWS_API_URL || 'http://localhost:8000'

export async function fetchLatestNews(period: 'day' | 'week' | 'month' = 'day'): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/news/${period}`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: NewsResponse = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch news')
    }

    return result.data
  } catch (error) {
    console.error(`Error fetching ${period} news:`, error)
    throw error // Re-throw to let component handle the error
  }
}

export async function fetchAllNews(): Promise<AllNewsResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/news/all`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: AllNewsResponse = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch all news')
    }

    return result
  } catch (error) {
    console.error('Error fetching all news:', error)
    return null
  }
} 