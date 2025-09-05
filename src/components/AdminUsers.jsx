import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase.js";

export default function AdminUsers({ colors, user }) {
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
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
    >
      <h2
        className="text-xl font-bold text-center mb-4"
        style={{ color: colors.primary }}
      >
        Admin panel
      </h2>
      <div className="h-100 w-full p-4 px-0 md:px-4">
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: colors.primary }}
        >
          Användarhantering
        </h3>
        {loading ? (
          <div>Laddar användare...</div>
        ) : (
          <table className="w-full text-left mb-4">
            <thead>
              <tr>
                <th className="py-2">Namn</th>
                <th className="py-2">Roll</th>
                <th className="py-2">Tema</th>
                <th className="py-2">ELområde</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-1">{u.full_name}</td>
                  <td className="py-1">{u.role || "user"}</td>
                  <td className="py-1">{u.theme || "-"}</td>
                  <td className="py-1">{u.area || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Lägg till fler adminfunktioner här */}
      </div>
    </div>
  );
}
