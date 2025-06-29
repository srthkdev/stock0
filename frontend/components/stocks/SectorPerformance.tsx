import { cn } from "@/lib/utils"

async function fetchSectorPerformance() {
  // Check if API key is available
  if (!process.env.FMP_API_KEY) {
    return null
  }

  const url = `https://financialmodelingprep.com/api/v3/sector-performance?apikey=${process.env.FMP_API_KEY}`
  const options = {
    method: "GET",
    next: {
      revalidate: 3600,
    },
  }
  
  try {
    const res = await fetch(url, options)

    if (!res.ok) {
      console.warn("Failed to fetch sector performance:", res.status, res.statusText)
      return null
    }
    return res.json()
  } catch (error) {
    console.warn("Error fetching sector performance:", error)
    return null
  }
}

interface Sector {
  sector: string
  changesPercentage: string
}

// Mock data for demonstration when API is not available
const mockSectorData: Sector[] = [
  { sector: "Technology", changesPercentage: "1.23" },
  { sector: "Healthcare", changesPercentage: "0.87" },
  { sector: "Financials", changesPercentage: "-0.45" },
  { sector: "Energy", changesPercentage: "2.10" },
  { sector: "Consumer Discretionary", changesPercentage: "0.65" },
  { sector: "Industrials", changesPercentage: "1.02" },
]

export default async function SectorPerformance() {
  const data = await fetchSectorPerformance()

  // Use mock data if API call failed or API key is missing
  const sectorData = data || mockSectorData

  if (!sectorData || sectorData.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
        <div>
          <p className="text-sm">Sector performance data unavailable</p>
          <p className="text-xs mt-1">Configure FMP_API_KEY for live data</p>
        </div>
      </div>
    )
  }

  const totalChangePercentage = sectorData.reduce((total: number, sector: Sector) => {
    return total + parseFloat(sector.changesPercentage)
  }, 0)

  const averageChangePercentage =
    (totalChangePercentage / sectorData.length).toFixed(2) + "%"

  const allSectors = {
    sector: "All sectors",
    changesPercentage: averageChangePercentage,
  }
  sectorData.unshift(allSectors)

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sectorData.map((sector: Sector) => (
          <div
            key={sector.sector}
            className="flex w-full flex-row items-center justify-between text-sm"
          >
          <span className="font-medium">{sector.sector}</span>
          <span
            className={cn(
              "w-[4rem] min-w-fit rounded-md px-2 py-0.5 text-right transition-colors",
              parseFloat(sector.changesPercentage) > 0
                ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-500"
            )}
          >
            {parseFloat(sector.changesPercentage).toFixed(2) + "%"}
          </span>
          </div>
        ))}
      </div>
    </div>
  )
}
