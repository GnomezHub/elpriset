import blixt from "/vite.svg";
import Footer from "./components/Footer";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Chart from "chart.js/auto";

// Main App component containing all the application logic and UI
export default function App() {
  const [area, setArea] = useState("SE4");
  const [day, setDay] = useState("today");
  const [priceData, setPriceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Define color palette from the Calm Neutral theme using useMemo to ensure it's stable
  const colors = useMemo(
    () => ({
      primary: "#2c3e50",
      secondary: "#F28C28",
      background: "#F8F7F4",
      card: "#ffffff",
      text: "#2c3e50",
      mutedText: "#6b7280",
      positive: "#16a34a",
      negative: "#dc2626",
      border: "#e5e7eb",
    }),
    []
  );

  // Helper function to fetch electricity price data from the new API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    const targetDate = new Date();
    if (day === "tomorrow") {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // Format the date for the API URL: YYYY/MM-DD
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dayOfMonth = String(targetDate.getDate()).padStart(2, "0");
    const dateUrl = `${year}/${month}-${dayOfMonth}`;

    try {
      const response = await fetch(
        `https://www.elprisetjustnu.se/api/v1/prices/${dateUrl}_${area}.json`
      );
      if (!response.ok) {
        throw new Error("Kunde inte hämta elprisdata.");
      }
      const data = await response.json();
      setPriceData(data);
    } catch (error) {
      console.error("Fel vid hämtning av elprisdata:", error);
      setIsError(true);
      setPriceData([]);
    } finally {
      setIsLoading(false);
    }
  }, [area, day]);

  // Function to convert SEK/kWh to öre/kWh
  const convertToSekOre = useCallback((priceInSekKWh) => {
    return priceInSekKWh * 100;
  }, []);

  // Function to create or update the Chart.js instance.
  const updateChart = useCallback(
    (data) => {
      if (!chartRef.current) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }

      if (data.length === 0) {
        return;
      }

      const labels = data.map(
        (p) =>
          `${String(new Date(p.time_start).getHours()).padStart(2, "0")}:00`
      );
      const prices = data.map((p) => convertToSekOre(p.SEK_per_kWh));

      const backgroundColors = prices.map((price) => {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (price === minPrice) return colors.positive;
        if (price === maxPrice) return colors.negative;
        return colors.primary;
      });

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Spotpris (öre/kWh)",
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
                label: (context) =>
                  `Spotpris: ${context.parsed.y.toFixed(2)} öre/kWh`,
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
    [colors, convertToSekOre]
  );

  // Effect hook to fetch price data whenever area or day changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect hook to update the chart whenever priceData changes
  useEffect(() => {
    updateChart(priceData);
  }, [priceData, updateChart]);

  // Derived state to compute stats and insights
  const getDailyStats = useCallback(() => {
    if (priceData.length === 0) {
      return null;
    }
    const rawPrices = priceData.map((p) => convertToSekOre(p.SEK_per_kWh));

    const minPrice = Math.min(...rawPrices);
    const maxPrice = Math.max(...rawPrices);
    const avgPrice =
      rawPrices.reduce((sum, p) => sum + p, 0) / rawPrices.length;

    const currentHour = new Date().getHours();
    const currentPriceData =
      day === "today"
        ? priceData.find(
            (p) => new Date(p.time_start).getHours() === currentHour
          )
        : null;
    const currentPrice = currentPriceData
      ? convertToSekOre(currentPriceData.SEK_per_kWh)
      : null;

    return {
      minPrice: minPrice.toFixed(2),
      maxPrice: maxPrice.toFixed(2),
      avgPrice: avgPrice.toFixed(2),
      currentPrice: currentPrice ? currentPrice.toFixed(2) : "-",
      dayData: priceData,
    };
  }, [priceData, day, convertToSekOre]);

  const getInsights = useCallback(
    (dayData, avgPrice, minPrice) => {
      const cheapestHours = dayData
        .filter((p) => convertToSekOre(p.SEK_per_kWh) <= minPrice * 1.1)
        .map((p) => new Date(p.time_start).getHours());
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
        `✅ Spotpriset för dagen är cirka <strong class="font-bold">${avgPrice} öre/kWh</strong>.`,
        `💡 De absolut billigaste timmarna har ett spotpris runt <strong class="font-bold text-green-700">${minPrice} öre/kWh</strong>.`,
        `🕒 Det är mest fördelaktigt att förbruka el under perioden <strong class="font-bold">${cheapestPeriod}</strong>.`,
      ];
    },
    [convertToSekOre]
  );

  const findBestTimeForTask = useCallback(
    (data, duration) => {
      let minAvgPrice = Infinity;
      let bestStartHour = -1;
      for (let i = 0; i <= data.length - duration; i++) {
        const chunk = data.slice(i, i + duration);
        const avgPrice =
          chunk.reduce((sum, p) => sum + convertToSekOre(p.SEK_per_kWh), 0) /
          duration;
        if (avgPrice < minAvgPrice) {
          minAvgPrice = avgPrice;
          bestStartHour = new Date(chunk[0].time_start).getHours();
        }
      }
      return { hour: bestStartHour, price: minAvgPrice };
    },
    [convertToSekOre]
  );

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
    <div
      className="min-h-screen py-8"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <style>{`
        .btn-active {
            background-color: ${colors.card};
            box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.1), 1px 1px 2px 0 rgba(0, 0, 0, 0.06);
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
          <img src={blixt} alt="Logo" className="mx-auto mb-4 w-16 h-16" />
          <h1
            className="text-4xl md:text-5xl font-extrabold"
            style={{ color: colors.primary }}
          >
            Elpriset-Dashboard
          </h1>
          <p className="mt-2 text-lg" style={{ color: colors.mutedText }}>
            Välj ditt elområde för att se priser och planera din förbrukning.
          </p>
        </header>

        <section
          className="rounded-xl shadow-md p-4 mb-8 sticky top-4 z-10 flex flex-col md:flex-row items-center justify-between gap-4 border"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <div className="flex items-center gap-4 w-full md:w-auto">
            <label
              htmlFor="area-select"
              className="font-semibold"
              style={{ color: colors.primary }}
            >
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
                title="Spotpris just nu"
                value={dailyStats.currentPrice}
                unit="öre/kWh"
                color={colors.primary}
              />
              <StatCard
                title="Lägsta spotpris"
                value={dailyStats.minPrice}
                unit="öre/kWh"
                color={colors.positive}
              />
              <StatCard
                title="Högsta spotpris"
                value={dailyStats.maxPrice}
                unit="öre/kWh"
                color={colors.negative}
              />
              <StatCard
                title="Snittspotpris"
                value={dailyStats.avgPrice}
                unit="öre/kWh"
                color={colors.primary}
              />
            </section>

            <section
              className="p-4 md:p-6 rounded-xl shadow-md mb-8 border"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <h2
                className="text-xl font-bold text-center mb-4"
                style={{ color: colors.primary }}
              >
                Spotpris per timme - {day === "today" ? "Idag" : "Imorgon"} (
                {area})
              </h2>
              <div className="chart-container">
                <canvas ref={chartRef}></canvas>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="p-6 rounded-xl shadow-md border"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ color: colors.primary }}
                >
                  Planeringshjälp
                </h2>
                <p className="mb-4" style={{ color: colors.mutedText }}>
                  Baserat på priserna, här är de bästa tiderna att köra dina
                  mest energikrävande apparater.
                </p>
                <PlanningTable
                  tasks={tasks}
                  data={dailyStats.dayData}
                  findBestTime={findBestTimeForTask}
                />
              </div>
              <div
                className="p-6 rounded-xl shadow-md border"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ color: colors.primary }}
                >
                  Dagens Insikter
                </h2>
                <div className="space-y-3" style={{ color: colors.text }}>
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
            <p
              className="text-xl font-semibold"
              style={{ color: colors.mutedText }}
            >
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
                {bestTime.hour === -1
                  ? "N/A"
                  : `${String(bestTime.hour).padStart(2, "0")}:00`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
