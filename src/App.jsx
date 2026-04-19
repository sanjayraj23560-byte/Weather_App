import Weather from "./components/Weather.jsx"
import "./App.css"

function App() {
  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="header-overlay">
          <div className="header-content">
            <h1 className="header-title">🌤️ WeatherNow</h1>
            <p className="header-sub">Real-time weather for any city in the world</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        <Weather />
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Powered by OpenWeatherMap · Built with React</p>
      </footer>

    </div>
  )
}

export default App