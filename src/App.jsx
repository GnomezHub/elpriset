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

// Theme definitions
const themes = {
  calm: {
    name: "Calm Neutral",
    primary: "#2c3e50",
    secondary: "#F28C28",
    background: "#F8F7F4",
    card: "#ffffff",
    text: "#2c3e50",
    mutedText: "#6b7280",
    positive: "#16a34a",
    negative: "#dc2626",
    border: "#e5e7eb",
  },
  dark: {
    name: "Dark Mode",
    primary: "#f8fafc",
    secondary: "#F28C28",
    background: "#0f172a",
    card: "#1e293b",
    text: "#f8fafc",
    mutedText: "#94a3b8",
    positive: "#22c55e",
    negative: "#ef4444",
    border: "#334155",
  },
  ocean: {
    name: "Ocean Blue",
    primary: "#0ea5e9",
    secondary: "#f59e0b",
    background: "#f0f9ff",
    card: "#ffffff",
    text: "#0c4a6e",
    mutedText: "#64748b",
    positive: "#059669",
    negative: "#dc2626",
    border: "#bae6fd",
  },
  forest: {
    name: "Forest Green",
    primary: "#166534",
    secondary: "#ea580c",
    background: "#f0fdf4",
    card: "#ffffff",
    text: "#14532d",
    mutedText: "#6b7280",
    positive: "#16a34a",
    negative: "#dc2626",
    border: "#bbf7d0",
  },
  sunset: {
    name: "Sunset Purple",
    primary: "#7c3aed",
    secondary: "#f59e0b",
    background: "#faf5ff",
    card: "#ffffff",
    text: "#581c87",
    mutedText: "#6b7280",
    positive: "#16a34a",
    negative: "#dc2626",
    border: "#e9d5ff",
  },
};

// Theme Selector Component
const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
        style={{
          backgroundColor: themes[currentTheme].card,
          color: themes[currentTheme].text,
          border: `1px solid ${themes[currentTheme].border}`,
        }}
      >
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: themes[currentTheme].primary }}
        />
        <span className="text-sm font-medium hidden sm:inline">
          {themes[currentTheme].name}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-20"
            style={{
              backgroundColor: themes[currentTheme].card,
              borderColor: themes[currentTheme].border,
            }}
          >
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  onThemeChange(key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:opacity-80 transition-all first:rounded-t-lg last:rounded-b-lg ${
                  currentTheme === key ? "opacity-100" : "opacity-70"
                }`}
                style={{ color: themes[currentTheme].text }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
                <span className="text-sm font-medium">{theme.name}</span>
                {currentTheme === key && (
                  <svg
                    className="w-4 h-4 ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Main App component containing all the application logic and UI
export default function App() {
  const [area, setArea] = useState("SE4");
  const [day, setDay] = useState("today");
  const [currentTheme, setCurrentTheme] = useState("calm");
  const [priceData, setPriceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Get current theme colors
  const colors = useMemo(() => themes[currentTheme], [currentTheme]);

  // Define tasks with useMemo to avoid recreating it on every render
  const tasks = useMemo(
    () => [
      { name: "Tvättmaskin", duration: 2, icon: "🧺" },
      { name: "Diskmaskin", duration: 2, icon: "🍽️" },
      { name: "Ladda elbil (långsamt)", duration: 4, icon: "🚗" },
    ],
    []
  );

  // Helper function to fetch electricity price data from the API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    const targetDate = new Date();
    if (day === "tomorrow") {
      targetDate.setDate(targetDate.getDate() + 1);
    }

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

  // Function to find the best (cheapest) time period for a given task duration
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

  // Function to find the worst (most expensive) time period for a given task duration
  const findWorstTimeForTask = useCallback(
    (data, duration) => {
      if (!data || data.length < duration) {
        return { hour: -1, price: -Infinity };
      }
      let maxAvgPrice = -Infinity;
      let worstStartHour = -1;
      for (let i = 0; i <= data.length - duration; i++) {
        const chunk = data.slice(i, i + duration);
        const avgPrice =
          chunk.reduce((sum, p) => sum + convertToSekOre(p.SEK_per_kWh), 0) /
          duration;
        if (avgPrice > maxAvgPrice) {
          maxAvgPrice = avgPrice;
          worstStartHour = new Date(chunk[0].time_start).getHours();
        }
      }
      return { hour: worstStartHour, price: maxAvgPrice };
    },
    [convertToSekOre]
  );

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

      // --- NEW: Logic to color chart bars based on the longest task ---
      const longestTaskDuration = Math.max(
        ...tasks.map((task) => task.duration),
        0
      );

      let bestPeriod = { hour: -1 };
      let worstPeriod = { hour: -1 };

      if (longestTaskDuration > 0 && data.length >= longestTaskDuration) {
        bestPeriod = findBestTimeForTask(data, longestTaskDuration);
        worstPeriod = findWorstTimeForTask(data, longestTaskDuration);
      }

      const backgroundColors = data.map((p) => {
        const hour = new Date(p.time_start).getHours();

        // Color green if the hour is within the best period for the longest task
        if (
          bestPeriod.hour !== -1 &&
          hour >= bestPeriod.hour &&
          hour < bestPeriod.hour + longestTaskDuration
        ) {
          return colors.positive;
        }

        // Color red if the hour is within the worst period for the longest task
        if (
          worstPeriod.hour !== -1 &&
          hour >= worstPeriod.hour &&
          hour < worstPeriod.hour + longestTaskDuration
        ) {
          return colors.negative;
        }

        // Default color for all other bars
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
              backgroundColor: colors.card,
              titleColor: colors.text,
              bodyColor: colors.text,
              borderColor: colors.border,
              borderWidth: 1,
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
    [colors, convertToSekOre, tasks, findBestTimeForTask, findWorstTimeForTask]
  );

  // Effect hook to fetch price data whenever area or day changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect hook to update the chart whenever priceData or the chart logic changes
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
        `💡 De absolut billigaste timmarna har ett spotpris runt <strong class="font-bold" style="color: ${colors.positive}">${minPrice} öre/kWh</strong>.`,
        `🕐 Det är mest fördelaktigt att förbruka el under perioden <strong class="font-bold">${cheapestPeriod}</strong>.`,
      ];
    },
    [convertToSekOre, colors.positive]
  );

  const dailyStats = getDailyStats();
  const insights = dailyStats
    ? getInsights(dailyStats.dayData, dailyStats.avgPrice, dailyStats.minPrice)
    : null;

  return (
    <div
      className="min-h-screen py-8 transition-all duration-300"
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
        .area-select {
          background-color: ${colors.background};
          border-color: ${colors.border};
          color: ${colors.text};
        }
        .area-select:focus {
          border-color: ${colors.secondary};
        }
      `}</style>
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <header className="text-center mb-8">
          <img src={blixt} alt="Logo" className="w-16 h-16 mx-auto" />

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
          className="rounded-xl shadow-md p-4 mb-8 sticky top-4 z-10 flex flex-col md:flex-row items-center justify-between gap-4 border transition-all duration-300"
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
              className="area-select border-2 rounded-lg p-2 focus:outline-none transition w-full"
            >
              <option value="SE1">SE1 - Norra Sverige</option>
              <option value="SE2">SE2 - Norra Mellansverige</option>
              <option value="SE3">SE3 - Södra Mellansverige</option>
              <option value="SE4">SE4 - Södra Sverige</option>
            </select>
          </div>
          <div className="flex-1 flex justify-end">
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />
          </div>
          <div
            className="flex items-center gap-2 rounded-lg p-1 w-full md:w-auto justify-center"
            style={{ backgroundColor: colors.background }}
          >
            <button
              onClick={() => setDay("today")}
              className={`px-4 py-2 rounded-md font-semibold transition w-1/2 md:w-auto ${
                day === "today" ? "btn-active" : ""
              }`}
              style={{ color: colors.mutedText }}
            >
              Idag
            </button>
            <button
              onClick={() => setDay("tomorrow")}
              className={`px-4 py-2 rounded-md font-semibold transition w-1/2 md:w-auto ${
                day === "tomorrow" ? "btn-active" : ""
              }`}
              style={{ color: colors.mutedText }}
            >
              Imorgon
            </button>
          </div>
        </section>

        {isLoading && (
          <div className="text-center py-16">
            <p
              className="text-xl font-semibold"
              style={{ color: colors.mutedText }}
            >
              Hämtar elpriser...
            </p>
          </div>
        )}

        {isError && !isLoading && (
          <div className="text-center py-16">
            <p
              className="text-xl font-semibold"
              style={{ color: colors.negative }}
            >
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
                backgroundColor={colors.card}
                borderColor={colors.border}
                textColor={colors.text}
                mutedTextColor={colors.mutedText}
              />
              <StatCard
                title="Lägsta spotpris"
                value={dailyStats.minPrice}
                unit="öre/kWh"
                color={colors.positive}
                backgroundColor={colors.card}
                borderColor={colors.border}
                textColor={colors.text}
                mutedTextColor={colors.mutedText}
              />
              <StatCard
                title="Högsta spotpris"
                value={dailyStats.maxPrice}
                unit="öre/kWh"
                color={colors.negative}
                backgroundColor={colors.card}
                borderColor={colors.border}
                textColor={colors.text}
                mutedTextColor={colors.mutedText}
              />
              <StatCard
                title="Snittspotpris"
                value={dailyStats.avgPrice}
                unit="öre/kWh"
                color={colors.primary}
                backgroundColor={colors.card}
                borderColor={colors.border}
                textColor={colors.text}
                mutedTextColor={colors.mutedText}
              />
            </section>

            <section
              className="p-4 md:p-6 rounded-xl shadow-md mb-8 border transition-all duration-300"
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
                className="p-6 rounded-xl shadow-md border transition-all duration-300"
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
                  colors={colors}
                />
              </div>
              <div
                className="p-6 rounded-xl shadow-md border transition-all duration-300"
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
            <Footer colors={colors} />
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
const StatCard = ({
  title,
  value,
  unit,
  color,
  backgroundColor,
  borderColor,
  mutedTextColor,
}) => (
  <div
    className="p-4 rounded-xl shadow-sm text-center border transition-all duration-300"
    style={{ backgroundColor, borderColor }}
  >
    <h3 className="text-sm font-semibold" style={{ color: mutedTextColor }}>
      {title}
    </h3>
    <p className="text-2xl md:text-3xl font-bold" style={{ color: color }}>
      {value}
    </p>
    <p className="text-xs" style={{ color: mutedTextColor }}>
      {unit}
    </p>
  </div>
);

// React component for the planning table
const PlanningTable = ({ tasks, data, findBestTime, colors }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b" style={{ borderColor: colors.border }}>
          <th className="py-2" style={{ color: colors.text }}>
            Aktivitet
          </th>
          <th className="py-2 text-right" style={{ color: colors.text }}>
            Bästa starttid
          </th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, index) => {
          const bestTime = findBestTime(data, task.duration);
          return (
            <tr
              key={index}
              className="border-b"
              style={{ borderColor: colors.border }}
            >
              <td className="py-3 font-semibold" style={{ color: colors.text }}>
                {task.icon} {task.name}
              </td>
              <td
                className="py-3 text-right font-bold"
                style={{ color: colors.positive }}
              >
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
