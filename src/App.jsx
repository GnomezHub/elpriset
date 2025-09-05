// import blixt from "/vite.svg";
import Footer from "./components/Footer";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Chart from "chart.js/auto";
import TaskPlan from "./components/TaskPlan";
import { themes } from "./utils/themes";
import ThemeSelector from "./components/ThemeSelector";
import UserAuth from "./components/UserAuth";
import { supabase } from "./utils/supabase.js";
import Insights from "./components/Insights.jsx";
import AdminPanel from "./components/AdminUsers.jsx";
import AdminThemes from "./components/AdminThemes.jsx";

// Main App component containing all the application logic and UI
export default function App() {
  const [area, setArea] = useState("SE3");
  const [day, setDay] = useState("today");
  const [currentTheme, setCurrentTheme] = useState("calm");
  const [priceData, setPriceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [showTomorrowInfo, setShowTomorrowInfo] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  //  const [selectedUserId, setSelectedUserId] = useState(null);
  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setUserRole(null);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!error && data?.role) setUserRole(data.role);
      else setUserRole(null);
    };
    fetchRole();
  }, [user]);

  // Get current theme colors
  const colors = useMemo(() => themes[currentTheme], [currentTheme]);
  // Fetch and apply user's theme preference on user change
  useEffect(() => {
    const fetchUserTheme = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("theme")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Kunde inte hämta tema:", error.message);
      } else if (data?.theme) {
        setCurrentTheme(data.theme); // uppdaterar temat globalt
      }
    };

    fetchUserTheme();
  }, [user]);

  useEffect(() => {
    const fetchArea = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("area")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Kunde inte hämta area:", error.message);
        return;
      }

      if (data?.area) {
        setArea(data.area); // Sätt användarens sparade area
      }
    };

    fetchArea();
  }, [user]);
  const handleAreaChange = async (e) => {
    const selectedArea = e.target.value;
    setArea(selectedArea); // Uppdatera UI direkt

    const { error } = await supabase
      .from("profiles")
      .update({ area: selectedArea })
      .eq("id", user.id);

    if (error) {
      console.error("Kunde inte uppdatera area:", error.message);
    }
  };

  const [tasks, setTasks] = useState([]);

  // Helper function to fetch electricity price data from the API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setShowTomorrowInfo(false);

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
        // Check if the current time is before 13:00 and the user selected "tomorrow"
        const now = new Date();
        if (day === "tomorrow" && now.getHours() < 13) {
          setShowTomorrowInfo(true);
          setPriceData([]);
        } else {
          throw new Error("Kunde inte hämta elprisdata.");
        }
      } else {
        const data = await response.json();
        setPriceData(data);
      }
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

      const now = new Date();
      const currentHour = now.getHours();
      console.log("Current hour:", currentHour);
      const filteredData =
        day === "today" // && currentHour > 5
          ? data.filter(
              (p) => new Date(p.time_start).getHours() >= currentHour - 5
            )
          : data;

      const labels = filteredData.map(
        (p) =>
          `${String(new Date(p.time_start).getHours()).padStart(2, "0")}:00`
      );
      const prices = filteredData.map((p) => convertToSekOre(p.SEK_per_kWh));

      // --- NEW: Logic to color chart bars based on the longest task ---
      const longestTaskDuration = Math.max(
        ...tasks.map((task) => task.duration),
        0
      );

      let bestPeriod = { hour: -1 };
      let worstPeriod = { hour: -1 };

      if (
        longestTaskDuration > 0 &&
        filteredData.length >= longestTaskDuration
      ) {
        bestPeriod = findBestTimeForTask(filteredData, longestTaskDuration);
        worstPeriod = findWorstTimeForTask(filteredData, longestTaskDuration);
      }

      const backgroundColors = filteredData.map((p) => {
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
    [
      colors,
      convertToSekOre,
      tasks,
      day,
      findBestTimeForTask,
      findWorstTimeForTask,
    ]
  );

  // Effect hook to fetch price data whenever area or day changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect hook to update the chart whenever priceData or the chart logic changes
  useEffect(() => {
    updateChart(priceData);
  }, [priceData, updateChart, tasks]); // Lägg till tasks här

  // Derived state to compute stats and insights
  const getDailyStats = useCallback(() => {
    if (priceData.length === 0) {
      return null;
    }
    const now = new Date();
    const currentHour = now.getHours();

    const filteredData =
      day === "today"
        ? priceData.filter(
            (p) => new Date(p.time_start).getHours() >= currentHour
          )
        : priceData;

    if (filteredData.length === 0) {
      return null;
    }

    const rawPrices = filteredData.map((p) => convertToSekOre(p.SEK_per_kWh));

    const minPrice = Math.min(...rawPrices);
    const maxPrice = Math.max(...rawPrices);
    const avgPrice =
      rawPrices.reduce((sum, p) => sum + p, 0) / rawPrices.length;

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
      dayData: filteredData,
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
          {/* <img src={blixt} alt="Logo" className="w-16 h-16 mx-auto" /> */}
          <div className="flex items-center justify-center gap-4">
            <h1
              className="text-4xl md:text-5xl font-extrabold"
              style={{ color: colors.primary }}
            >
              Elpriset
            </h1>
            <svg
              className="w-12 h-12"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: colors.secondary }}
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <h1
              className="text-4xl md:text-5xl font-extrabold"
              style={{ color: colors.primary }}
            >
              Dashboard
            </h1>
          </div>
          <p className="mt-2 text-lg" style={{ color: colors.mutedText }}>
            Välj ditt elområde för att se priser och planera din förbrukning.
          </p>
        </header>

        <section
          className="rounded-xl shadow-md p-4 mb-8 md:sticky top-4 z-10 flex flex-col md:flex-row items-center justify-between gap-4 border transition-all duration-300"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <div className="flex items-center gap-4 w-full lg:min-w-110  md:w-auto">
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
              onChange={handleAreaChange}
              className="area-select border-2 rounded-lg p-2 focus:outline-none transition w-full"
            >
              <option value="SE1">SE1 - Norra Sverige</option>
              <option value="SE2">SE2 - Norra Mellansverige</option>
              <option value="SE3">SE3 - Södra Mellansverige</option>
              <option value="SE4">SE4 - Södra Sverige</option>
            </select>
          </div>{" "}
          <div
            className="flex items-center gap-2 rounded-lg px-4 w-full max-w-50 md:w-auto justify-center"
            style={{ backgroundColor: colors.background }}
          >
            <button
              onClick={() => setDay("today")}
              className={`px-4 py-2 rounded-md font-semibold transition w-1/2 md:w-auto ${
                day === "today" ? "btn-active" : ""
              }`}
              // style={{ color: colors.mutedText }}
            >
              Idag
            </button>
            <button
              onClick={() => setDay("tomorrow")}
              className={`px-4 py-2 rounded-md font-semibold transition w-1/2 md:w-auto ${
                day === "tomorrow" ? "btn-active" : ""
              }`}
              //  style={{ color: colors.mutedText }}
            >
              Imorgon
            </button>
          </div>
          <div className="flex items-center gap-2 justify-center w-full md:w-auto">
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
              user={user}
            />
            <UserAuth colors={colors} user={user} setUser={setUser} />
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

        {showTomorrowInfo && (
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

        {!isLoading && !isError && dailyStats && !showTomorrowInfo && (
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
              <div className="h-100 w-full p-4 px-0 md:px-4">
                <canvas ref={chartRef}></canvas>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TaskPlan
                d_data={dailyStats.dayData}
                findBestTime={findBestTimeForTask}
                colors={colors}
                user={user}
                tasks={tasks}
                setTasks={setTasks}
              />
              {userRole === "admin" ? (
                <AdminPanel colors={colors} user={user} />
              ) : (
                <Insights colors={colors} insights={insights} />
              )}
            </section>
            {userRole === "admin" && (
              <section>
                <AdminThemes colors={colors} user={user} />
              </section>
            )}
            <Footer colors={colors} />
          </main>
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
