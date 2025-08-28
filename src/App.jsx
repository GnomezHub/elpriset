import Chart from "chart.js/auto";
import viteBlixt from "/vite.svg";
import Footer from "./components/Footer";
import React, { useState, useEffect, useRef, useCallback } from "react";

// Main App component containing all the application logic and UI
export default function App() {
  const [area, setArea] = useState("SE4");
  const [day, setDay] = useState("today");
  const [priceData, setPriceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Define color palette from the Calm Neutral theme
  const colors = {
    primary: "#2c3e50",
    secondary: "#F28C28",
    background: "#F8F7F4",
    card: "#ffffff",
    text: "#2c3e50",
    mutedText: "#6b7280",
    positive: "#16a34a",
    negative: "#dc2626",
    border: "#e5e7eb",
  };

  // Helper function to fetch data from the API.
  // Using useCallback to memoize the function, preventing infinite re-renders.
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(
        `https://api.spot-hinta.fi/TodayAndDayForward?areas=${area}`
      );
      if (!response.ok) {
        throw new Error("Kunde inte hämta data från Spot-hinta.fi");
      }
      const data = await response.json();
      setPriceData(data);
    } catch (error) {
      console.error("Fel vid hämtning av elprisdata:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [area]); // The function is only recreated when 'area' changes

  // Function to create or update the Chart.js instance.
  // Wrapped in useCallback to prevent re-creation on every render.
  const updateChart = useCallback(
    (data) => {
      if (!chartRef.current) return;

      // Destroy existing chart to prevent rendering issues with new data
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }

      // Do not create a new chart if there is no data
      if (data.length === 0) {
        return;
      }

      const labels = data.map(
        (p) => `${String(new Date(p.DateTime).getHours()).padStart(2, "0")}:00`
      );
      const prices = data.map((p) => p.PriceWithTax);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const backgroundColors = prices.map((price) => {
        if (price === minPrice) return colors.positive;
        if (price === maxPrice) return colors.negative;
        return colors.primary;
      });

      // Create a new chart instance
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Pris (öre/kWh)",
              data: prices,
              backgroundColor: backgroundColors,
              borderColor: "transparent",
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => `Kl. ${tooltipItems[0].label}`,
                label: (context) => `${context.parsed.y.toFixed(2)} öre/kWh`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "öre/kWh",
                color: colors.mutedText,
              },
              ticks: { color: colors.mutedText },
              grid: { color: colors.border },
            },
            x: {
              ticks: { color: colors.mutedText },
              grid: { display: false },
            },
          },
        },
      });
    },
    [
      colors.positive,
      colors.negative,
      colors.primary,
      colors.mutedText,
      colors.border,
    ]
  ); // Dependencies for useCallback

  // Effect hook to fetch data whenever area changes
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Now the dependency is the memoized fetchData function

  // Effect hook to update the chart whenever priceData or day changes
  useEffect(() => {
    const targetDate = new Date();
    if (day === "tomorrow") {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const dayData = priceData.filter(
      (p) => new Date(p.DateTime).toDateString() === targetDate.toDateString()
    );
    updateChart(dayData);
  }, [priceData, day, updateChart]); // Added updateChart as a dependency

  // Derived state to compute stats and insights
  const getDailyStats = () => {
    const targetDate = new Date();
    if (day === "tomorrow") {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const dayData = priceData.filter(
      (p) => new Date(p.DateTime).toDateString() === targetDate.toDateString()
    );
    if (dayData.length === 0) {
      return null;
    }
    const prices = dayData.map((p) => p.PriceWithTax);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const currentHour = new Date().getHours();
    const currentPriceData =
      day === "today"
        ? dayData.find((p) => new Date(p.DateTime).getHours() === currentHour)
        : null;
    const currentPrice = currentPriceData
      ? currentPriceData.PriceWithTax
      : null;

    return {
      minPrice: minPrice.toFixed(2),
      maxPrice: maxPrice.toFixed(2),
      avgPrice: avgPrice.toFixed(2),
      currentPrice: currentPrice ? currentPrice.toFixed(2) : "-",
      dayData,
    };
  };

  const getInsights = (dayData, avgPrice, minPrice) => {
    const cheapestHours = dayData
      .filter((p) => p.PriceWithTax <= minPrice * 1.1)
      .map((p) => new Date(p.DateTime).getHours());
    if (cheapestHours.length === 0) {
      return ["Inga specifika lågpristimmar kunde identifieras."];
    }
    const sortedHours = [...new Set(cheapestHours)].sort((a, b) => a - b);
    const cheapestPeriod = `${String(sortedHours[0]).padStart(
      2,
      "0"
    )}:00 - ${String(sortedHours[sortedHours.length - 1] + 1).padStart(
      2,
      "0"
    )}:00`;
    return [
      `✅ Snittpriset för dagen är <strong class="font-bold">${avgPrice} öre/kWh</strong>.`,
      `💡 De absolut billigaste timmarna har ett pris runt <strong class="font-bold text-green-700">${minPrice} öre/kWh</strong>.`,
      `🕒 Det är mest fördelaktigt att förbruka el under perioden <strong class="font-bold">${cheapestPeriod}</strong>.`,
    ];
  };

  const findBestTimeForTask = (data, duration) => {
    let minAvgPrice = Infinity;
    let bestStartHour = -1;
    for (let i = 0; i <= data.length - duration; i++) {
      const chunk = data.slice(i, i + duration);
      const avgPrice =
        chunk.reduce((sum, p) => sum + p.PriceWithTax, 0) / duration;
      if (avgPrice < minAvgPrice) {
        minAvgPrice = avgPrice;
        bestStartHour = new Date(chunk[0].DateTime).getHours();
      }
    }
    return { hour: bestStartHour, price: minAvgPrice };
  };

  const tasks = [
    { name: "Tvättmaskin", duration: 2, icon: "🧺" },
    { name: "Diskmaskin", duration: 2, icon: "🍽️" },
    { name: "Ladda elbil (långsamt)", duration: 4, icon: "🚗" },
  ];

  const dailyStats = getDailyStats();
  const insights = dailyStats
    ? getInsights(dailyStats.dayData, dailyStats.avgPrice, dailyStats.minPrice)
    : null;

  return (
    <div className="bg-background min-h-screen py-8 text-text">
      <style>{`
        .btn-active {
            background-color: ${colors.card};
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            color: ${colors.primary};
        }
        .chart-container {
          height: 400px;
          width: 100%;
          padding: 1rem;
        }
      `}</style>
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <header className="text-center mb-8">
          <img
            src={viteBlixt}
            alt="ElprisBlixt"
            className="mx-auto mb-4 w-16 h-16"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
            Din Elpris-Dashboard
          </h1>
          <p className="mt-2 text-lg text-mutedText">
            Välj ditt elområde för att se priser och planera din förbrukning.
          </p>
        </header>

        <section
          className="bg-white rounded-xl shadow-md p-4 mb-8 sticky top-4 z-10 flex flex-col md:flex-row items-center justify-between gap-4 border border-border"
        >
          <div className="flex items-center gap-4 w-full md:w-auto">
            <label htmlFor="area-select" className="font-semibold text-primary">
              Elområde:
            </label>
            <select
              id="area-select"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="bg-gray-100 border-2 border-border rounded-lg p-2 focus:outline-none focus:border-secondary transition w-full"
            >
              <option value="SE1">SE1 - Norra Sverige</option>
              <option value="SE2">SE2 - Norra Mellansverige</option>
              <option value="SE3">SE3 - Södra Mellansverige</option>
              <option value="SE4">SE4 - Södra Sverige</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-full md:w-auto justify-center">
            <button
              onClick={() => setDay("today")}
              className={`px-4 py-2 rounded-md font-semibold text-mutedText transition w-1/2 md:w-auto ${
                day === "today" ? "btn-active" : ""
              }`}
            >
              Idag
            </button>
            <button
              onClick={() => setDay("tomorrow")}
              className={`px-4 py-2 rounded-md font-semibold text-mutedText transition w-1/2 md:w-auto ${
                day === "tomorrow" ? "btn-active" : ""
              }`}
            >
              Imorgon
            </button>
          </div>
        </section>

        {isLoading && (
          <div className="text-center py-16">
            <p className="text-xl font-semibold text-mutedText">
              Hämtar elpriser...
            </p>
          </div>
        )}

        {isError && !isLoading && (
          <div className="text-center py-16">
            <p className="text-xl font-semibold text-negative">
              Kunde inte hämta elprisdata. Försök igen senare.
            </p>
          </div>
        )}

        {!isLoading && !isError && dailyStats && (
          <main>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              <StatCard
                title="Nuvarande Pris"
                value={dailyStats.currentPrice}
                unit="öre/kWh"
                color={colors.primary}
              />
              <StatCard
                title="Lägsta Pris"
                value={dailyStats.minPrice}
                unit="öre/kWh"
                color={colors.positive}
              />
              <StatCard
                title="Högsta Pris"
                value={dailyStats.maxPrice}
                unit="öre/kWh"
                color={colors.negative}
              />
              <StatCard
                title="Snittpris"
                value={dailyStats.avgPrice}
                unit="öre/kWh"
                color={colors.primary}
              />
            </section>

            <section className="bg-card p-4 md:p-6 rounded-xl shadow-md mb-8 border border-border">
              <h2 className="text-xl font-bold text-center mb-4 text-primary">
                Elpris per timme - {day === "today" ? "Idag" : "Imorgon"} (
                {area})
              </h2>
              <div className="chart-container">
                <canvas ref={chartRef}></canvas>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl shadow-md border border-border">
                <h2 className="text-xl font-bold mb-4 text-primary">
                  Planeringshjälp
                </h2>
                <p className="text-mutedText mb-4">
                  Baserat på priserna, här är de bästa tiderna att köra dina
                  mest energikrävande apparater.
                </p>
                <PlanningTable
                  tasks={tasks}
                  data={dailyStats.dayData}
                  findBestTime={findBestTimeForTask}
                />
              </div>
              <div className="bg-card p-6 rounded-xl shadow-md border border-border">
                <h2 className="text-xl font-bold mb-4 text-primary">
                  Dagens Insikter
                </h2>
                <div className="space-y-3 text-text">
                  {insights &&
                    insights.map((insight, index) => (
                      <p
                        key={index}
                        dangerouslySetInnerHTML={{ __html: insight }}
                      />
                    ))}
                </div>
              </div>
            </section>
            <Footer />
          </main>
        )}

        {!isLoading && !isError && !dailyStats && (
          <div className="text-center py-16">
            <p className="text-xl font-semibold text-mutedText">
              Prisdata för imorgon är inte tillgänglig ännu. Den blir
              tillgänglig efter kl. 13:00.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// React component for the KPI cards
const StatCard = ({ title, value, unit, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-200">
    <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
    <p className="text-2xl md:text-3xl font-bold" style={{ color: color }}>
      {value}
    </p>
    <p className="text-xs text-gray-400">{unit}</p>
  </div>
);

// React component for the planning table
const PlanningTable = ({ tasks, data, findBestTime }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b">
          <th className="py-2">Aktivitet</th>
          <th className="py-2 text-right">Bästa starttid</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, index) => {
          const bestTime = findBestTime(data, task.duration);
          return (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-3 font-semibold">
                {task.icon} {task.name}
              </td>
              <td className="py-3 text-right font-bold text-green-700">
                {String(bestTime.hour).padStart(2, "0")}:00
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
