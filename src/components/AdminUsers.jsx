import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase.js";

export default function AdminUsers({
  colors,
  user,
  selectedUserId,
  setSelectedUserId,
  selectedUserName,
  setSelectedUserName,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleMsg, setRoleMsg] = useState("");
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

  // Funktion för att uppdatera roll i databasen
  const handleRoleChange = async (userId, newRole) => {
    setRoleMsg("");
    // Optimistisk UI-uppdatering
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    // Uppdatera i databasen
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    if (error) {
      setRoleMsg("Fel vid uppdatering av roll: " + error.message);
    } else {
      setRoleMsg("Roll uppdaterad!");
    }
    // Timeout för att ta bort meddelandet
    setTimeout(() => setRoleMsg(""), 2500);
  };

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
                <th className="py-2">Tema</th>
                <th className="py-2">Roll</th>
                <th className="py-2">Elområde</th>
                <th className="py-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setSelectedUserName(u.full_name || u.email || "");
                  }}
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
                    "transition-all duration-150  " +
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
                  <td className="py-1  overflow-x-clip max-w-20">
                    {u.full_name}
                  </td>
                  <td className="py-1">{u.theme || "-"}</td>
                  <td className="pl-2 py-1">
                    <select
                      value={u.role || "user"}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="border rounded px-1 py-0.5"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>

                  <td className="py-1">{u.area || "-"}</td>
                  <td className="py-1 overflow-x-clip max-w-20">{u.email}</td>
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
            <b>{selectedUserName}</b>
            {roleMsg && (
              <div
                className="mt-2 text-sm"
                style={{
                  color: roleMsg.startsWith("Fel")
                    ? "#e53e3e"
                    : colors._secondary,
                }}
              >
                {roleMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
