import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase.js";

export default function AdminUsers({ colors, user, selectedUserId, setSelectedUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Hämta alla användare (exempel)
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  if (!user) return <div>Du måste vara inloggad som admin.</div>;

  return (
    <div
      className="p-6 rounded-xl shadow-md border transition-all duration-300"
      style={{
        backgroundColor: colors._card,
        borderColor: colors._border,
      }}
    >
      <h2
        className="text-xl font-bold text-center mb-4"
        style={{ color: colors._primary }}
      >
        Admin panel
      </h2>
      <div className="h-full w-full p-4 px-0 md:px-4">
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: colors._primary }}
        >
          Användarhantering
        </h3>
        {loading ? (
          <div>Laddar användare...</div>
        ) : (
          <table className="w-full text-left mb-4">
            <thead>
              <tr>
                <th className="py-2">bild</th>
                <th className="py-2">Namn</th>
                <th className="py-2">Email</th>
                <th className="py-2">Roll</th>
                <th className="py-2">Tema</th>
                <th className="py-2">Elområde</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedUserId === u.id ? colors._secondary + "22" : "",
                    border:
                      selectedUserId === u.id
                        ? `2px solid ${colors._secondary}`
                        : undefined,
                  }}
                  className={
                    "transition-all duration-150 " +
                    (selectedUserId === u.id ? "font-bold" : "")
                  }
                >
                  <td className="py-1">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt={u.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      "Ingen bild"
                    )}
                  </td>
                  <td className="py-1">{u.full_name}</td>
                  <td className="py-1 overflow-x-clip max-w-20">{u.email}</td>
                  <td className="pl-2 py-1">{u.role || "user"}</td>
                  <td className="py-1">{u.theme || "-"}</td>
                  <td className="py-1">{u.area || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {selectedUserId && (
          <div
            className="mt-4 p-2 rounded border"
            style={{ borderColor: colors._secondary, color: colors._primary }}
          >
            Vald användare:{" "}
            <b>{users.find((u) => u.id === selectedUserId)?.full_name || ""}</b>
          </div>
        )}
        {/* Lägg till fler adminfunktioner här */}
      </div>
    </div>
  );
}
