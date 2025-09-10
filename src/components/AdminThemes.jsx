import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase.js";

export default function AdminThemes({ colors, user }) {
  const [themeColors, setThemeColors] = useState(colors);

  useEffect(() => {
    setThemeColors(colors);
  }, [colors]);

  if (!user) return <div>Du måste vara inloggad som admin.</div>;

  const handleColorChange = async (key, newColor) => {
    setThemeColors((prev) => ({ ...prev, [key]: newColor }));

    // const { error } = await supabase.from("themes").upsert(
    //   [
    //     {
    //       theme_key: key,
    //       color: newColor,
    //       updated_by: user.id,
    //     },
    //   ],
    //   { onConflict: ["theme_key"] }
    // );
    // if (error) {
    //   alert("Fel vid sparande till databasen: " + error.message);
    // }
  };

  return (
    <div
      className="p-6 my-8 rounded-xl shadow-md border transition-all duration-300"
      style={{
        backgroundColor: themeColors._card,
        borderColor: themeColors._border,
      }}
    >
      <h2
        className="text-xl font-bold text-center mb-4"
        style={{ color: themeColors._primary }}
      >
        Teman panel
      </h2>
      <div className="h-full w-full p-4 px-0 md:px-4">
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: themeColors._primary }}
        >
          {themeColors._name || "Temahantering"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(themeColors)
            .filter(([key]) => key !== "_name")
            .map(([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-4 p-2 rounded border"
                style={{
                  borderColor: themeColors._border,
                  background: themeColors._background,
                }}
              >
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-8 h-8 rounded shadow border"
                  title={key}
                  style={{
                    minWidth: 32,
                    minHeight: 32,
                    border: "1px solid #ccc",
                  }}
                />
                <div>
                  <div className="font-semibold">{key}</div>
                  <div className="text-xs" style={{ color: themeColors.text }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
        </div>
        {/* Lägg till fler adminfunktioner här */}
      </div>
    </div>
  );
}
