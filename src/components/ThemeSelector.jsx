import React, { useState } from "react";
import { themes } from "../utils/themes.js";
import { supabase } from "../utils/supabase.js";

// Theme Selector Component
export default function ThemeSelector({ currentTheme, onThemeChange, user }) {
  const [isOpen, setIsOpen] = useState(false);
//   console.log("ThemeSelector rendered user: ", user);
//   console.log("ThemeSelector currentTheme: ", currentTheme);

  const handleThemeChange = async (key) => {
    onThemeChange(key);
    setIsOpen(false);

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ theme: key })
        .eq("id", user.id);

      if (error) {
        console.error("Kunde inte spara tema:", error.message);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
        style={{
          backgroundColor: themes[currentTheme]._card,
          color: themes[currentTheme]._text,
          border: `1px solid ${themes[currentTheme]._border}`,
        }}
      >
        <div
          className="w-4 h-4 rounded-full"
          style={{
            border: `1px solid ${themes[currentTheme]._border}`,
            backgroundColor:
              themes[currentTheme]._name === "Dark Mode" ||
              themes[currentTheme]._name === "Light Calm"
                ? themes[currentTheme]._background
                : themes[currentTheme]._primary,
          }}
        />
        <span className="text-sm font-medium">
          {themes[currentTheme]._name}
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
              backgroundColor: themes[currentTheme]._card,
              borderColor: themes[currentTheme]._border,
            }}
          >
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:opacity-80 transition-all first:rounded-t-lg last:rounded-b-lg ${
                  currentTheme === key ? "opacity-100" : "opacity-70"
                }`}
                style={{ color: themes[currentTheme]._text }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor:
                      theme._name === "Dark Mode" ||
                      theme._name === "Light Calm"
                        ? theme._background
                        : theme._primary,
                  }}
                />
                <span className="text-sm font-medium">{theme._name}</span>
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
}
