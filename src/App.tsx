"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { WeatherChart } from "@/components/weather-chart"
import { Spinner } from "@/components/ui/spinner"
import { Cloud, Wind, Droplets, MapPin } from "lucide-react"

interface WeatherData {
  current: {
    temperature_2m: number
    wind_speed_10m: number
    time: string
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    relative_humidity_2m: number[]
    wind_speed_10m: number[]
  }
}

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://weather-ncj4.onrender.com/v1/api")

        if (!response.ok) {
          throw new Error("Failed to fetch weather data")
        }

        const data = await response.json()
        setWeatherData(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("[v0] Error fetching weather:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
    // Refresh data every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Loading weather data...</p>
        </div>
      </div>
    )
  }

  if (error || !weatherData) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Card className="max-w-md p-6">
          <h2 className="mb-2 text-lg font-semibold text-destructive">Error Loading Weather Data</h2>
          <p className="text-muted-foreground">{error || "No data available"}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Make sure your backend is accessible at weather-ncj4.onrender.com
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Weather Dashboard</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Bhopal, India</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(weatherData.current.time).toLocaleTimeString()}
          </div>
        </div>

        {/* Current Conditions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-chart-1/20 bg-chart-1/5 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                <p className="mt-2 text-4xl font-bold text-foreground">{weatherData.current.temperature_2m}°C</p>
              </div>
              <div className="rounded-lg bg-chart-1/20 p-3">
                <Cloud className="h-6 w-6 text-chart-1" />
              </div>
            </div>
          </Card>

          <Card className="border-chart-2/20 bg-chart-2/5 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wind Speed</p>
                <p className="mt-2 text-4xl font-bold text-foreground">
                  {weatherData.current.wind_speed_10m}
                  <span className="ml-1 text-xl">km/h</span>
                </p>
              </div>
              <div className="rounded-lg bg-chart-2/20 p-3">
                <Wind className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </Card>

          <Card className="border-chart-3/20 bg-chart-3/5 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Humidity</p>
                <p className="mt-2 text-4xl font-bold text-foreground">
                  {Math.round(weatherData.hourly.relative_humidity_2m.slice(0, 24).reduce((a, b) => a + b, 0) / 24)}%
                </p>
              </div>
              <div className="rounded-lg bg-chart-3/20 p-3">
                <Droplets className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <WeatherChart
            title="Temperature (24h)"
            data={weatherData.hourly.time.slice(0, 24).map((time, i) => ({
              time: new Date(time).getHours() + ":00",
              value: weatherData.hourly.temperature_2m[i],
            }))}
            dataKey="value"
            color="var(--color-chart-1)"
            unit="°C"
          />

          <WeatherChart
            title="Wind Speed (24h)"
            data={weatherData.hourly.time.slice(0, 24).map((time, i) => ({
              time: new Date(time).getHours() + ":00",
              value: weatherData.hourly.wind_speed_10m[i],
            }))}
            dataKey="value"
            color="var(--color-chart-2)"
            unit="km/h"
          />

          <WeatherChart
            title="Humidity (24h)"
            data={weatherData.hourly.time.slice(0, 24).map((time, i) => ({
              time: new Date(time).getHours() + ":00",
              value: weatherData.hourly.relative_humidity_2m[i],
            }))}
            dataKey="value"
            color="var(--color-chart-3)"
            unit="%"
          />
        </div>
      </div>
    </div>
  )
}
