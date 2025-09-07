import React from "react";

export default function Insights({ colors, insights }) {
  return (
    <div
      className="p-6 rounded-xl shadow-md border transition-all duration-300"
      style={{
        backgroundColor: colors._card,
        borderColor: colors._border,
      }}
    >
      <h2 className="text-xl font-bold mb-4" style={{ color: colors._primary }}>
        Dagens Insikter
      </h2>
      <div className="space-y-3" style={{ color: colors._text }}>
        {insights &&
          insights.map((insight, index) => (
            <p key={index} dangerouslySetInnerHTML={{ __html: insight }} />
          ))}
      </div>
    </div>
  );
}
