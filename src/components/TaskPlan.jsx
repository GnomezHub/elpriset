import { supabase } from "../utils/supabase.js";
import { useEffect, useState } from "react";

export default function TaskPlan({ d_data, findBestTime, colors }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
console.log("TaskPlan rendered");

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .is("userId", null); // WHERE "userId" IS NULL

      if (error) setError(error.message);
      else setTasks(data);
      setLoading(false);
      console.log("Fetched tasks:", data);
    };
    fetchTasks();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
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
            const bestTime = findBestTime(d_data, task.duration);
            console.log(task.name, bestTime);
            return (
              <tr
                key={index}
                className="border-b"
                style={{ borderColor: colors.border }}
              >
                <td
                  className="py-3 font-semibold"
                  style={{ color: colors.text }}
                >
                  {task.icon} {task.name} ({task.duration} h)
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
}
