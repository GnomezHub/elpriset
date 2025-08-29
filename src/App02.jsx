import React, { useState, useEffect, useMemo } from "react";

// Helper function to format the date as YYYY-MM-DD
const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}/${month}-${day}`;
};

// Helper function to get the current hour (0-23)
const getCurrentHour = () => new Date().getHours();

// Icon component for a simple loading spinner
const SpinnerIcon = () => (
  <svg
    className="animate-spin h-8 w-8 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// Main Application Component
export default function App02() {
  // State variables
  const [prices, setPrices] = useState([]);
  const [zone, setZone] = useState("SE4"); // Default to elområde 4
  const [date, setDate] = useState(getFormattedDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const zones = ["SE1", "SE2", "SE3", "SE4"];
  const currentHour = getCurrentHour();

  // Effect to fetch data when zone or date changes
  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      setError(null);

      try {
        // Corrected the URL to use YYYY-MM-DD format directly, which is more standard.
        const response = await fetch(
          `https://www.elprisetjustnu.se/api/v1/prices/${date}_${zone}.json`
        );
        if (!response.ok) {
          // Provide a more descriptive error if the API returns a non-ok status
          if (response.status === 404) {
            throw new Error(
              `Kunde inte hitta prisdata för ${date}. Prova ett annat datum. (Status: 404)`
            );
          }
          throw new Error(`Kunde inte hämta data. Status: ${response.status}`);
        }
        const data = await response.json();
        setPrices(data);
      } catch (err) {
        setError(err.message);
        setPrices([]); // Clear old data on error
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [zone, date]);

  // useMemo to calculate the highest price only when prices change
  const highestPrice = useMemo(() => {
    if (prices.length === 0) return null;
    return Math.max(...prices.map((p) => p.SEK_per_kWh));
  }, [prices]);

  // Main render function
  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400">
            Elpriser Just Nu
          </h1>
          <p className="text-gray-400 mt-2">
            Timpriser för el i Sverige - {date}
          </p>
        </header>

        {/* Zone Selector */}
        <div className="flex justify-center flex-wrap gap-2 mb-8 bg-gray-800 p-2 rounded-lg">
          {zones.map((z) => (
            <button
              key={z}
              onClick={() => setZone(z)}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                zone === z
                  ? "bg-cyan-500 text-gray-900 shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {`Elområde ${z.slice(-1)}`}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main>
          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <SpinnerIcon />
              <p className="mt-4 text-lg">Laddar priser för {zone}...</p>
            </div>
          )}

          {error && (
            <div className="text-center bg-red-900/50 border border-red-700 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-red-400">
                Ett fel uppstod
              </h2>
              <p className="text-red-300 mt-2">{error}</p>
              <p className="text-gray-400 mt-1">
                Detta kan bero på att priserna för dagen inte har publicerats
                än.
              </p>
            </div>
          )}

          {!loading && !error && prices.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {prices.map((priceInfo) => {
                const hour = new Date(priceInfo.time_start).getHours();
                const isCurrentHour = hour === currentHour;
                const isHighestPrice = priceInfo.SEK_per_kWh === highestPrice;

                // Dynamic classes for styling cards based on state
                let cardClasses =
                  "bg-gray-800 p-4 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 flex flex-col justify-between";
                if (isCurrentHour) cardClasses += " ring-2 ring-cyan-400";
                if (isHighestPrice) cardClasses += " ring-2 ring-red-500";
                if (isCurrentHour && isHighestPrice)
                  cardClasses =
                    "bg-gray-800 p-4 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 flex flex-col justify-between ring-2 ring-gradient-to-r from-cyan-400 to-red-500";

                return (
                  <div key={priceInfo.time_start} className={cardClasses}>
                    <div>
                      <div className="text-gray-400 text-sm font-medium">
                        {new Date(priceInfo.time_start).toLocaleTimeString(
                          "sv-SE",
                          { hour: "2-digit", minute: "2-digit" }
                        )}{" "}
                        -{" "}
                        {new Date(priceInfo.time_end).toLocaleTimeString(
                          "sv-SE",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                      <div className="text-3xl font-bold my-2">
                        {(priceInfo.SEK_per_kWh * 100).toFixed(2)}
                        <span className="text-lg text-gray-400 ml-1">
                          öre/kWh
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-xs">
                      {isCurrentHour && (
                        <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                          Nu
                        </span>
                      )}
                      {isHighestPrice && (
                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full ml-auto">
                          Högst
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
