import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase.js";

export default function AdminThemes({ colors, user }) {
  if (!user) return <div>Du måste vara inloggad som admin.</div>;

  return (
    <div
      className="p-6 my-8 rounded-xl shadow-md border transition-all duration-300"
      style={{
        backgroundColor: colors._card,
        borderColor: colors._border,
      }}
    >
      <h2
        className="text-xl font-bold text-center mb-4"
        style={{ color: colors._primary }}
      >
        Teman panel
      </h2>
      <div className="h-full w-full p-4 px-0 md:px-4">
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: colors._primary }}
        >
          Temahantering
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(colors).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-4 p-2 rounded border"
              style={{
                borderColor: colors._border,
                background: colors._background,
              }}
            >
              <div
                className="w-8 h-8 rounded shadow"
                style={{ background: value, border: "1px solid #ccc" }}
                title={key}
              />
              <div>
                <div className="font-semibold">{key}</div>
                <div className="text-xs" style={{ color: colors.text }}>
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
