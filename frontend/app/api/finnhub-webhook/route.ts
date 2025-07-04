import { NextRequest, NextResponse } from 'next/server'

// Use environment variable for webhook secret instead of hardcoding it
const FINNHUB_WEBHOOK_SECRET = process.env.FINNHUB_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    // Verify the webhook secret
    const secret = request.headers.get('X-Finnhub-Secret')
    
    if (!FINNHUB_WEBHOOK_SECRET) {
      console.error('FINNHUB_WEBHOOK_SECRET environment variable is not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    if (secret !== FINNHUB_WEBHOOK_SECRET) {
      console.log('Invalid webhook secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the webhook data
    const data = await request.json()
    
    console.log('Finnhub webhook received:', data)
    
    // Process the webhook data here
    // Example: Save to database, send notifications, etc.
    
    // For trades data, the structure is typically:
    // {
    //   "data": [
    //     {
    //       "s": "AAPL",      // Symbol
    //       "p": 150.25,      // Price
    //       "t": 1640995200,  // Timestamp
    //       "v": 100          // Volume
    //     }
    //   ],
    //   "type": "trade"
    // }
    
    if (data.type === 'trade') {
      data.data.forEach((trade: any) => {
        console.log(`Trade: ${trade.s} at $${trade.p} (volume: ${trade.v})`)
        // Handle individual trade data
      })
    }
    
    // Must return 2xx status to acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Finnhub webhook endpoint' })
} 