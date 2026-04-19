import { useState, useEffect, useCallback } from "react"
import axios from "axios"

const API_KEY = "d78a9fc836a30a1a46a962c0d2d12af2"

const getIcon = (main) => {
  const icons = {
    Clear:        "☀️",
    Clouds:       "☁️",
    Rain:         "🌧️",
    Drizzle:      "🌦️",
    Thunderstorm: "⛈️",
    Snow:         "❄️",
    Mist:         "🌫️",
    Fog:          "🌫️",
    Haze:         "🌫️",
  }
  return icons[main] || "🌡️"
}

const getBg = (main) => {
  const bgs = {
    Clear:        "linear-gradient(135deg, #1a1a2e, #16213e)",
    Clouds:       "linear-gradient(135deg, #1a1a2e, #222244)",
    Rain:         "linear-gradient(135deg, #0f0f1a, #1a2a3a)",
    Drizzle:      "linear-gradient(135deg, #0f0f1a, #1a2a3a)",
    Thunderstorm: "linear-gradient(135deg, #0a0a0f, #1a1020)",
    Snow:         "linear-gradient(135deg, #1a1a2e, #202040)",
    Mist:         "linear-gradient(135deg, #111118, #1e1e30)",
  }
  return bgs[main] || "linear-gradient(135deg, #0a0a0f, #1a1a2e)"
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function Weather() {
  const [city, setCity]       = useState("")
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [isLocal, setIsLocal] = useState(false)

  // ── Fetch by coordinates ───────────────────────────────────────
  const fetchByCoords = useCallback(async (lat, lon) => {
    console.log("📍 Fetching by coords:", lat, lon)
    setLoading(true)
    setError("")
    setWeather(null)

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      console.log("🌐 URL:", url)
      const res = await axios.get(url)
      console.log("✅ Got data:", res.data)
      setWeather(res.data)
      setCity(res.data.name)
      setIsLocal(true)
    } catch (err) {
      console.error("❌ Coords error:", err)
      setError("Could not fetch local weather. Search manually.")
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch by city name ─────────────────────────────────────────
  const fetchByCity = async (cityName) => {
    if (!cityName.trim()) {
      setError("Please enter a city name")
      return
    }
    setLoading(true)
    setError("")
    setWeather(null)
    setIsLocal(false)

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      const res = await axios.get(url)
      setWeather(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError("City not found. Please check spelling.")
      } else if (err.response?.status === 401) {
        setError("Invalid API key.")
      } else {
        setError("Something went wrong. Try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Get location on mount ──────────────────────────────────────
  useEffect(() => {
    console.log("🚀 useEffect running")

    if (!navigator.geolocation) {
      console.log("❌ Geolocation not supported")
      setError("Geolocation not supported. Search manually.")
      return
    }

    console.log("📡 Requesting location...")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Got position:", position.coords)
        fetchByCoords(
          position.coords.latitude,
          position.coords.longitude
        )
      },
      (err) => {
        console.error("❌ Location denied:", err.message)
        setError("Location access denied. Search for a city manually.")
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [fetchByCoords])

  const handleSearch = () => {
    setIsLocal(false)
    fetchByCity(city)
  }

  const handleKey = (e) => {
    if (e.key === "Enter") {
      setIsLocal(false)
      fetchByCity(city)
    }
  }

  return (
    <div className="weather-wrapper">

      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search any city..."
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-box">
          <div className="spinner" />
          <p>{isLocal ? "📍 Detecting your location..." : "Fetching weather..."}</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="error-box">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Weather Card */}
      {weather && !loading && (
        <div
          className="weather-card"
          style={{ background: getBg(weather.weather[0].main) }}
        >
          {/* Location tag */}
          {isLocal && (
            <div className="location-tag">📍 Your Location</div>
          )}

          {/* City + Country */}
          <div className="city-row">
            <div>
              <h2 className="city-name">
                {weather.name}, {weather.sys.country}
              </h2>
              <p className="city-date">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year:    "numeric",
                  month:   "long",
                  day:     "numeric"
                })}
              </p>
            </div>
            <div className="weather-icon">
              {getIcon(weather.weather[0].main)}
            </div>
          </div>

          {/* Temperature */}
          <div className="temp-row">
            <span className="temp-big">
              {Math.round(weather.main.temp)}°C
            </span>
            <div className="temp-details">
              <span className="feels-like">
                Feels like {Math.round(weather.main.feels_like)}°C
              </span>
              <span className="description">
                {weather.weather[0].description.charAt(0).toUpperCase() +
                  weather.weather[0].description.slice(1)}
              </span>
              <span className="temp-range">
                H: {Math.round(weather.main.temp_max)}° &nbsp;
                L: {Math.round(weather.main.temp_min)}°
              </span>
            </div>
          </div>

          <div className="card-divider" />

          {/* Stats */}
          <div className="stats-grid">
            <StatCard
              label="Humidity"
              value={weather.main.humidity + "%"}
              icon="💧"
            />
            <StatCard
              label="Wind"
              value={weather.wind.speed + " m/s"}
              icon="💨"
            />
            <StatCard
              label="Pressure"
              value={weather.main.pressure + " hPa"}
              icon="🔵"
            />
            <StatCard
              label="Visibility"
              value={(weather.visibility / 1000).toFixed(1) + " km"}
              icon="👁️"
            />
            <StatCard
              label="Sunrise"
              value={new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], {
                hour: "2-digit", minute: "2-digit"
              })}
              icon="🌅"
            />
            <StatCard
              label="Sunset"
              value={new Date(weather.sys.sunset * 1000).toLocaleTimeString([], {
                hour: "2-digit", minute: "2-digit"
              })}
              icon="🌇"
            />
          </div>
        </div>
      )}

      {/* Default — nothing loaded yet */}
      {!weather && !loading && !error && (
        <div className="default-state">
          <span className="default-icon">🌍</span>
          <p className="default-text">Allow location access to see local weather</p>
          <p className="default-hint">Or search any city above</p>
        </div>
      )}

    </div>
  )
}

export default Weather